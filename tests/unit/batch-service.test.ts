import { describe, it, expect, beforeEach } from 'vitest';
import { PayoutBatchService } from '@/lib/services/batch-service';
import { PayoutBatchRepository } from '@/lib/repositories/batch-repository';
import { MockPayoutProvider } from '@/lib/providers/mock-provider';

describe('PayoutBatchService Lifecycle & Business Invariants', () => {
  let repo: PayoutBatchRepository;
  let provider: MockPayoutProvider;
  let service: PayoutBatchService;

  beforeEach(() => {
    repo = new PayoutBatchRepository();
    repo.clear();
    provider = new MockPayoutProvider();
    service = new PayoutBatchService(repo, provider);
  });

  it('creates a batch in DRAFT status and correctly computes lossless sum', async () => {
    const res = await service.createBatch({
      title: 'October 2026 Batch',
      employerId: 'emp_demo',
      asset: 'VND',
      items: [
        { recipientName: 'Alice', recipientReference: '970401', amount: '15000000', asset: 'VND' },
        { recipientName: 'Bob', recipientReference: '970402', amount: '22000000', asset: 'VND' },
      ],
    });

    expect(res.isDuplicate).toBe(false);
    expect(res.batch.status).toBe('DRAFT');
    expect(res.batch.sourceAmountTotal).toBe('37000000');
    expect(res.batch.items).toHaveLength(2);
  });

  it('enforces BR-01 / FR-07: rejects execution if batch is not in APPROVED state', async () => {
    const created = await service.createBatch({
      title: 'Unapproved Batch',
      employerId: 'emp_demo',
      asset: 'VND',
      items: [
        { recipientName: 'Alice', recipientReference: '970401', amount: '1000000', asset: 'VND' },
      ],
    });

    // Attempting to execute directly from DRAFT must throw
    await expect(
      service.executeBatch(created.batch.id, 'actor_1', 'KEY_1')
    ).rejects.toThrow(/Execution rejected: Batch is not in APPROVED status/);

    // Validate batch -> status becomes VALIDATED
    await service.validateBatch(created.batch.id, 'actor_1');

    // Attempting to execute directly from VALIDATED must still throw
    await expect(
      service.executeBatch(created.batch.id, 'actor_1', 'KEY_1')
    ).rejects.toThrow(/Execution rejected: Batch is not in APPROVED status/);
  });

  it('runs the full end-to-end happy path: DRAFT -> VALIDATED -> APPROVED -> EXECUTED (COMPLETED)', async () => {
    const created = await service.createBatch({
      title: 'Happy Path Batch',
      employerId: 'emp_demo',
      asset: 'VND',
      items: [
        { recipientName: 'Alice', recipientReference: '970401', amount: '15000000', asset: 'VND' },
        { recipientName: 'Bob', recipientReference: '970402', amount: '22000000', asset: 'VND' },
        { recipientName: 'Charlie', recipientReference: '970403', amount: '8500000', asset: 'VND' },
      ],
    });

    // Step 1: Validate
    const validated = await service.validateBatch(created.batch.id, 'admin_user');
    expect(validated.status).toBe('VALIDATED');

    // Step 2: Approve
    const approved = await service.approveBatch(created.batch.id, 'executive_approver');
    expect(approved.status).toBe('APPROVED');
    expect(approved.approvedBy).toBe('executive_approver');

    // Step 3: Execute
    const executed = await service.executeBatch(created.batch.id, 'admin_user', 'IDEM_EXEC_KEY_99');
    expect(executed.status).toBe('COMPLETED');
    expect(executed.items).toHaveLength(3);

    // Check provider references were populated on items
    for (const item of executed.items) {
      expect(item.status).toBe('SUCCESS');
      expect(item.providerReference).toMatch(/^MOCK-9PAY-TXN-/);
    }

    // Check audit trail
    const auditTrail = await service.getAuditTrail(created.batch.id);
    const eventTypes = auditTrail.map((e) => e.eventType);
    expect(eventTypes).toContain('BATCH_CREATED');
    expect(eventTypes).toContain('BATCH_VALIDATED');
    expect(eventTypes).toContain('BATCH_APPROVED');
    expect(eventTypes).toContain('BATCH_EXECUTION_STARTED');
    expect(eventTypes).toContain('BATCH_EXECUTION_COMPLETED');
  });

  it('enforces idempotency on batch creation: returns duplicate when key matches', async () => {
    const fixedKey = 'IDEM-FIXED-KEY-123';
    const first = await service.createBatch({
      title: 'Batch First',
      employerId: 'emp_demo',
      idempotencyKey: fixedKey,
      asset: 'VND',
      items: [{ recipientName: 'Alice', recipientReference: '970401', amount: '1000000', asset: 'VND' }],
    });
    expect(first.isDuplicate).toBe(false);

    const second = await service.createBatch({
      title: 'Batch Duplicate',
      employerId: 'emp_demo',
      idempotencyKey: fixedKey,
      asset: 'VND',
      items: [{ recipientName: 'Alice', recipientReference: '970401', amount: '1000000', asset: 'VND' }],
    });
    expect(second.isDuplicate).toBe(true);
    expect(second.batch.id).toBe(first.batch.id);
  });
});
