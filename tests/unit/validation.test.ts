import { describe, it, expect } from 'vitest';
import { CreateBatchInputSchema, PayoutItemInputSchema } from '@/lib/validation/batch';

describe('Zod Validation Schemas', () => {
  it('validates a valid payout item', () => {
    const valid = {
      recipientName: 'Nguyen Van A',
      recipientReference: '9704050012345678',
      bankCode: 'VCB',
      amount: '15000000',
      asset: 'VND',
    };
    const res = PayoutItemInputSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects an item with zero or negative amount', () => {
    const invalidZero = {
      recipientName: 'Nguyen Van A',
      recipientReference: '9704050012345678',
      amount: '0',
    };
    const res = PayoutItemInputSchema.safeParse(invalidZero);
    expect(res.success).toBe(false);
  });

  it('rejects an empty batch with no recipients', () => {
    const emptyBatch = {
      title: 'Empty Batch',
      employerId: 'emp_123',
      items: [],
    };
    const res = CreateBatchInputSchema.safeParse(emptyBatch);
    expect(res.success).toBe(false);
  });

  it('accepts a valid batch with multiple recipients', () => {
    const validBatch = {
      title: 'Valid Oct 2026 Batch',
      employerId: 'emp_123',
      asset: 'VND',
      items: [
        {
          recipientName: 'User 1',
          recipientReference: '970401',
          amount: '1000000',
        },
        {
          recipientName: 'User 2',
          recipientReference: '970402',
          amount: '2000000',
        },
      ],
    };
    const res = CreateBatchInputSchema.safeParse(validBatch);
    expect(res.success).toBe(true);
  });
});
