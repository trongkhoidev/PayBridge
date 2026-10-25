import {
  PayrollBatch,
  PayoutItem,
  AuditEvent,
  PayoutProvider,
} from '@/types';
import { PayoutBatchRepository, batchRepository } from '../repositories/batch-repository';
import { getPayoutProvider } from '../providers';
import { sumAmounts } from '../utils/currency';
import { CreateBatchInput } from '../validation/batch';

export class PayoutBatchService {
  constructor(
    private readonly repo: PayoutBatchRepository = batchRepository,
    private readonly provider: PayoutProvider = getPayoutProvider()
  ) {}

  /**
   * Create a new draft batch or return existing if idempotency key matches.
   */
  async createBatch(input: CreateBatchInput): Promise<{ batch: PayrollBatch; isDuplicate: boolean }> {
    const employerId = input.employerId;
    const idempotencyKey = input.idempotencyKey || `BATCH-IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Check existing batch with same idempotency key for this employer
    const existing = await this.repo.getBatchByIdempotencyKey(idempotencyKey, employerId);
    if (existing) {
      return { batch: existing, isDuplicate: true };
    }

    const batchId = `pb_batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const items: PayoutItem[] = input.items.map((item, index) => ({
      id: `pb_item_${batchId}_${index + 1}`,
      batchId,
      recipientName: item.recipientName,
      recipientReference: item.recipientReference,
      bankCode: item.bankCode,
      amount: item.amount,
      asset: item.asset || input.asset,
      status: 'PENDING',
    }));

    // Lossless decimal-safe total calculation
    const totalAmount = sumAmounts(items.map((it) => it.amount));

    const newBatch: PayrollBatch = {
      id: batchId,
      title: input.title,
      employerId,
      status: 'DRAFT',
      asset: input.asset,
      sourceAmountTotal: totalAmount,
      provider: this.provider.isMock ? 'mock' : 'ninepay',
      idempotencyKey,
      items,
      createdAt: now,
      updatedAt: now,
    };

    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      batchId,
      actorId: employerId,
      eventType: 'BATCH_CREATED',
      toStatus: 'DRAFT',
      metadataRedacted: {
        itemCount: items.length,
        totalAmount,
        asset: input.asset,
        provider: newBatch.provider,
      },
      createdAt: now,
    };

    const saved = await this.repo.createBatch(newBatch, auditEvent);
    return { batch: saved, isDuplicate: false };
  }

  /**
   * Validate a draft batch against business rules & provider recipient checks.
   */
  async validateBatch(batchId: string, actorId: string): Promise<PayrollBatch> {
    const batch = await this.repo.getBatchById(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    if (batch.status !== 'DRAFT') {
      throw new Error(`Only DRAFT batches can be validated. Current status: ${batch.status}`);
    }

    // Validate items
    for (const item of batch.items) {
      const recipientCheck = await this.provider.validateRecipient({
        recipientReference: item.recipientReference,
        recipientName: item.recipientName,
        bankCode: item.bankCode,
        asset: item.asset,
      });

      if (!recipientCheck.isValid) {
        throw new Error(
          `Recipient validation failed for ${item.recipientName} (${item.recipientReference}): ${recipientCheck.errorMessage || 'Invalid recipient'}`
        );
      }
    }

    const now = new Date().toISOString();
    const updated: PayrollBatch = {
      ...batch,
      status: 'VALIDATED',
      updatedAt: now,
    };

    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      batchId,
      actorId,
      eventType: 'BATCH_VALIDATED',
      fromStatus: 'DRAFT',
      toStatus: 'VALIDATED',
      createdAt: now,
    };

    return this.repo.updateBatch(updated, event);
  }

  /**
   * Approve a validated batch. Required before execution.
   */
  async approveBatch(batchId: string, approverId: string): Promise<PayrollBatch> {
    const batch = await this.repo.getBatchById(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    if (batch.status !== 'VALIDATED') {
      throw new Error(`Batch must be in VALIDATED state to approve. Current status: ${batch.status}`);
    }

    const now = new Date().toISOString();
    const updated: PayrollBatch = {
      ...batch,
      status: 'APPROVED',
      approvedBy: approverId,
      approvedAt: now,
      updatedAt: now,
    };

    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      batchId,
      actorId: approverId,
      eventType: 'BATCH_APPROVED',
      fromStatus: 'VALIDATED',
      toStatus: 'APPROVED',
      createdAt: now,
    };

    return this.repo.updateBatch(updated, event);
  }

  /**
   * Execute batch payout through configured provider adapter.
   * INVARIANT: Fails if batch is not in APPROVED state.
   */
  async executeBatch(batchId: string, actorId: string, idempotencyKey: string): Promise<PayrollBatch> {
    const batch = await this.repo.getBatchById(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    // Critical Invariant: FR-07, BR-01
    if (batch.status !== 'APPROVED') {
      throw new Error(
        `Execution rejected: Batch is not in APPROVED status. Current status: ${batch.status}`
      );
    }

    const now = new Date().toISOString();

    // Mark as PROCESSING
    const processingBatch: PayrollBatch = {
      ...batch,
      status: 'PROCESSING',
      updatedAt: now,
    };

    await this.repo.updateBatch(processingBatch, {
      id: `audit_${Date.now()}_start`,
      batchId,
      actorId,
      eventType: 'BATCH_EXECUTION_STARTED',
      fromStatus: 'APPROVED',
      toStatus: 'PROCESSING',
      createdAt: now,
    });

    try {
      const submission = await this.provider.submitPayout({
        batchId: batch.id,
        idempotencyKey,
        asset: batch.asset,
        items: batch.items.map((it) => ({
          itemId: it.id,
          recipientReference: it.recipientReference,
          recipientName: it.recipientName,
          bankCode: it.bankCode,
          amount: it.amount,
          asset: it.asset,
        })),
      });

      // Update items with provider references and status
      const updatedItems = batch.items.map((item) => {
        const itemResult = submission.results.find((r) => r.itemId === item.id);
        if (itemResult) {
          return {
            ...item,
            status: itemResult.status,
            providerReference: itemResult.providerReference,
            failureCode: itemResult.failureCode,
            failureMessageSafe: itemResult.failureMessageSafe,
          };
        }
        return item;
      });

      const finishedNow = new Date().toISOString();
      const completedBatch: PayrollBatch = {
        ...batch,
        status: submission.batchStatus,
        items: updatedItems,
        updatedAt: finishedNow,
      };

      const eventType =
        submission.batchStatus === 'COMPLETED'
          ? 'BATCH_EXECUTION_COMPLETED'
          : 'BATCH_EXECUTION_FAILED';

      return await this.repo.updateBatch(completedBatch, {
        id: `audit_${Date.now()}_complete`,
        batchId,
        actorId,
        eventType,
        fromStatus: 'PROCESSING',
        toStatus: submission.batchStatus,
        metadataRedacted: {
          isMock: submission.isMock,
          providerBatchReference: submission.providerBatchReference,
          messageSafe: submission.messageSafe,
        },
        createdAt: finishedNow,
      });
    } catch (err: unknown) {
      // Invariant: Handle uncertain result - timeout / connection loss moves to REQUIRES_REVIEW
      const errMessage = err instanceof Error ? err.message : 'Unknown provider error';
      const reviewNow = new Date().toISOString();

      const reviewBatch: PayrollBatch = {
        ...batch,
        status: 'REQUIRES_REVIEW',
        updatedAt: reviewNow,
      };

      return await this.repo.updateBatch(reviewBatch, {
        id: `audit_${Date.now()}_error`,
        batchId,
        actorId,
        eventType: 'BATCH_REQUIRES_REVIEW',
        fromStatus: 'PROCESSING',
        toStatus: 'REQUIRES_REVIEW',
        metadataRedacted: {
          errorSummary: errMessage,
        },
        createdAt: reviewNow,
      });
    }
  }

  async getBatch(batchId: string): Promise<PayrollBatch | null> {
    return this.repo.getBatchById(batchId);
  }

  async listBatches(employerId?: string): Promise<PayrollBatch[]> {
    return this.repo.listBatches(employerId);
  }

  async getAuditTrail(batchId: string): Promise<AuditEvent[]> {
    return this.repo.getAuditEvents(batchId);
  }
}

export const payoutBatchService = new PayoutBatchService();
