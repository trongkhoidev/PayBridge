import {
  PayoutProvider,
  ValidateRecipientInput,
  ValidateRecipientResult,
  PayoutSubmissionRequest,
  PayoutSubmissionResponse,
  PayoutProviderStatusResult,
} from '@/types';

/**
 * MockPayoutProvider
 * Strictly marked as MOCK as required by AGENTS.md and ARCHITECTURE.md.
 * Does NOT interact with real money or real bank networks.
 */
export class MockPayoutProvider implements PayoutProvider {
  public readonly providerName = 'Mock 9Pay Testnet Payout Adapter';
  public readonly isMock = true;

  // In-memory idempotency cache for provider-level submissions
  private readonly submissions = new Map<string, PayoutSubmissionResponse>();

  async validateRecipient(input: ValidateRecipientInput): Promise<ValidateRecipientResult> {
    // Basic mock validation rules for VN banking / e-wallet test
    if (!input.recipientReference || input.recipientReference.length < 4) {
      return {
        isValid: false,
        errorMessage: 'Invalid recipient reference length',
      };
    }

    return {
      isValid: true,
      normalizedReference: input.recipientReference.trim(),
      accountHolderName: input.recipientName?.toUpperCase() || 'MOCK RECIPIENT',
    };
  }

  async submitPayout(request: PayoutSubmissionRequest): Promise<PayoutSubmissionResponse> {
    // Idempotency check: if already submitted under this key, return saved result
    if (this.submissions.has(request.idempotencyKey)) {
      return this.submissions.get(request.idempotencyKey)!;
    }

    const batchRef = `MOCK-9PAY-BATCH-${Date.now()}`;
    const results = request.items.map((item, index) => ({
      itemId: item.itemId,
      status: 'SUCCESS' as const,
      providerReference: `MOCK-9PAY-TXN-${batchRef}-${index + 1}`,
    }));

    const response: PayoutSubmissionResponse = {
      isMock: true,
      batchStatus: 'COMPLETED',
      providerBatchReference: batchRef,
      results,
      messageSafe: 'Mock payout batch processed successfully via simulation adapter.',
    };

    this.submissions.set(request.idempotencyKey, response);
    return response;
  }

  async getPayoutStatus(providerBatchReference: string): Promise<PayoutProviderStatusResult> {
    // Lookup existing mock submission
    for (const cached of this.submissions.values()) {
      if (cached.providerBatchReference === providerBatchReference) {
        return {
          providerBatchReference,
          status: cached.batchStatus,
          results: cached.results,
        };
      }
    }

    // Default mock response
    return {
      providerBatchReference,
      status: 'COMPLETED',
      results: [],
    };
  }
}
