export type BatchStatus =
  | 'DRAFT'
  | 'VALIDATED'
  | 'QUOTED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PARTIALLY_FAILED'
  | 'FAILED'
  | 'REQUIRES_REVIEW';

export type PayoutItemStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'SUCCESS'
  | 'FAILED'
  | 'REQUIRES_REVIEW';

export interface PayoutItem {
  id: string;
  batchId: string;
  recipientName: string;
  recipientReference: string; // e.g., bank account or wallet phone number
  bankCode?: string;
  amount: string; // Decimal-safe / lossless integer representation (e.g. "5000000" for VND)
  asset: string; // e.g. "VND"
  status: PayoutItemStatus;
  providerReference?: string;
  failureCode?: string;
  failureMessageSafe?: string;
}

export interface PayrollBatch {
  id: string;
  title: string;
  employerId: string;
  status: BatchStatus;
  asset: string;
  sourceAmountTotal: string; // Lossless total
  feeTotal?: string;
  provider: 'mock' | 'ninepay' | 'stellar';
  idempotencyKey: string;
  items: PayoutItem[];
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AuditEvent {
  id: string;
  batchId: string;
  actorId: string;
  eventType:
    | 'BATCH_CREATED'
    | 'BATCH_VALIDATED'
    | 'BATCH_QUOTED'
    | 'BATCH_APPROVED'
    | 'BATCH_EXECUTION_STARTED'
    | 'BATCH_EXECUTION_COMPLETED'
    | 'BATCH_EXECUTION_FAILED'
    | 'BATCH_REQUIRES_REVIEW';
  fromStatus?: BatchStatus;
  toStatus?: BatchStatus;
  metadataRedacted?: Record<string, unknown>;
  createdAt: string;
}

// Provider Types
export interface ValidateRecipientInput {
  recipientReference: string;
  recipientName?: string;
  bankCode?: string;
  asset: string;
}

export interface ValidateRecipientResult {
  isValid: boolean;
  normalizedReference?: string;
  accountHolderName?: string;
  errorMessage?: string;
}

export interface PayoutSubmissionItem {
  itemId: string;
  recipientReference: string;
  recipientName: string;
  bankCode?: string;
  amount: string;
  asset: string;
}

export interface PayoutSubmissionRequest {
  batchId: string;
  idempotencyKey: string;
  asset: string;
  items: PayoutSubmissionItem[];
}

export interface PayoutItemExecutionResult {
  itemId: string;
  status: PayoutItemStatus;
  providerReference: string;
  failureCode?: string;
  failureMessageSafe?: string;
}

export interface PayoutSubmissionResponse {
  isMock: boolean;
  batchStatus: BatchStatus;
  providerBatchReference: string;
  results: PayoutItemExecutionResult[];
  messageSafe?: string;
}

export interface PayoutProviderStatusResult {
  providerBatchReference: string;
  status: BatchStatus;
  results: PayoutItemExecutionResult[];
}

export interface PayoutProvider {
  readonly providerName: string;
  readonly isMock: boolean;
  validateRecipient(input: ValidateRecipientInput): Promise<ValidateRecipientResult>;
  submitPayout(request: PayoutSubmissionRequest): Promise<PayoutSubmissionResponse>;
  getPayoutStatus(providerBatchReference: string): Promise<PayoutProviderStatusResult>;
}

// AI Advisor Placeholder Types
export interface BatchSummaryRequest {
  batch: PayrollBatch;
}

export interface BatchSummaryResponse {
  summary: string;
  actionableNotes: string[];
  riskWarnings: string[];
}

export interface AIAdvisorService {
  summarizeBatch(request: BatchSummaryRequest): Promise<BatchSummaryResponse>;
}
