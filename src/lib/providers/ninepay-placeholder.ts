import {
  PayoutProvider,
  ValidateRecipientInput,
  ValidateRecipientResult,
  PayoutSubmissionRequest,
  PayoutSubmissionResponse,
  PayoutProviderStatusResult,
} from '@/types';

/**
 * NinePayPayoutProvider (Placeholder for official 9Pay chi hộ integration)
 * Awaiting official 9Pay testnet techspec verification (base URL, HMAC checksum, exact payload fields).
 * Per AGENTS.md and requirements: Do not invent API shapes or fake credentials.
 */
export class NinePayPayoutProvider implements PayoutProvider {
  public readonly providerName = '9Pay Testnet Payout Adapter';
  public readonly isMock = false;

  private readonly merchantKey?: string;
  private readonly secretKey?: string;
  private readonly apiBaseUrl?: string;

  constructor() {
    this.merchantKey = process.env.NINEPAY_MERCHANT_KEY;
    this.secretKey = process.env.NINEPAY_SECRET_KEY;
    this.apiBaseUrl = process.env.NINEPAY_API_BASE_URL;
  }

  private isConfigured(): boolean {
    return Boolean(
      this.merchantKey &&
      this.merchantKey !== 'placeholder_merchant_key' &&
      this.secretKey &&
      this.secretKey !== 'placeholder_secret_key' &&
      this.apiBaseUrl
    );
  }

  async validateRecipient(input: ValidateRecipientInput): Promise<ValidateRecipientResult> {
    if (!this.isConfigured()) {
      throw new Error(
        '9Pay Testnet adapter is not configured with official credentials. Please use MockPayoutProvider for demo.'
      );
    }
    // TODO: Connect to official 9Pay recipient verification endpoint once techspec is confirmed
    return {
      isValid: true,
      normalizedReference: input.recipientReference,
    };
  }

  async submitPayout(request: PayoutSubmissionRequest): Promise<PayoutSubmissionResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        '9Pay Testnet adapter is not configured with official credentials. Please use MockPayoutProvider for demo.'
      );
    }
    // TODO: Connect to official 9Pay payout execution endpoint with HMAC checksum and idempotency
    throw new Error('9Pay live testnet submission is pending verified API contract specification.');
  }

  async getPayoutStatus(providerBatchReference: string): Promise<PayoutProviderStatusResult> {
    if (!this.isConfigured()) {
      throw new Error(
        '9Pay Testnet adapter is not configured with official credentials. Please use MockPayoutProvider for demo.'
      );
    }
    // TODO: Connect to official 9Pay status query endpoint
    throw new Error('9Pay live status query is pending verified API contract specification.');
  }
}
