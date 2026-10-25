import { z } from 'zod';
import { isPositiveAmount } from '../utils/currency';

export const PayoutItemInputSchema = z.object({
  recipientName: z.string().trim().min(1, 'Recipient name is required').max(100),
  recipientReference: z
    .string()
    .trim()
    .min(4, 'Recipient reference must be at least 4 characters')
    .max(50, 'Recipient reference too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Recipient reference must be alphanumeric'),
  bankCode: z.string().trim().optional(),
  amount: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Amount must be an integer string without decimals or spaces')
    .refine((val) => isPositiveAmount(val), {
      message: 'Amount must be greater than zero',
    }),
  asset: z.string().trim().min(2).max(10).default('VND'),
});

export const CreateBatchInputSchema = z.object({
  title: z.string().trim().min(2, 'Batch title is required').max(100),
  employerId: z.string().trim().min(1, 'Employer ID is required'),
  asset: z.string().trim().min(2).max(10).default('VND'),
  idempotencyKey: z.string().trim().min(1).optional(),
  items: z
    .array(PayoutItemInputSchema)
    .min(1, 'Batch must contain at least one payout item')
    .max(50, 'Demo batch limited to maximum 50 recipients'),
});

export const ApproveBatchInputSchema = z.object({
  approverId: z.string().trim().min(1, 'Approver ID is required'),
});

export const ExecuteBatchInputSchema = z.object({
  idempotencyKey: z.string().trim().min(1, 'Idempotency key is required'),
});

export type PayoutItemInput = z.infer<typeof PayoutItemInputSchema>;
export type CreateBatchInput = z.infer<typeof CreateBatchInputSchema>;
export type ApproveBatchInput = z.infer<typeof ApproveBatchInputSchema>;
export type ExecuteBatchInput = z.infer<typeof ExecuteBatchInputSchema>;
