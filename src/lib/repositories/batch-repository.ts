import { PayrollBatch, AuditEvent } from '@/types';

/**
 * PayoutBatchRepository
 * In-memory repository with globalThis persistence across Next.js dev server reloads.
 */
interface StorageState {
  batches: Map<string, PayrollBatch>;
  auditEvents: AuditEvent[];
}

const globalForRepo = globalThis as unknown as {
  __paybridge_repo_storage?: StorageState;
};

function getStorage(): StorageState {
  if (!globalForRepo.__paybridge_repo_storage) {
    globalForRepo.__paybridge_repo_storage = {
      batches: new Map<string, PayrollBatch>(),
      auditEvents: [],
    };
  }
  return globalForRepo.__paybridge_repo_storage;
}

export class PayoutBatchRepository {
  private get storage(): StorageState {
    return getStorage();
  }

  async createBatch(batch: PayrollBatch, initialEvent?: AuditEvent): Promise<PayrollBatch> {
    this.storage.batches.set(batch.id, { ...batch });
    if (initialEvent) {
      this.storage.auditEvents.push({ ...initialEvent });
    }
    return { ...batch };
  }

  async getBatchById(id: string): Promise<PayrollBatch | null> {
    const found = this.storage.batches.get(id);
    if (!found) return null;
    return { ...found, items: [...found.items] };
  }

  async getBatchByIdempotencyKey(key: string, employerId: string): Promise<PayrollBatch | null> {
    for (const batch of this.storage.batches.values()) {
      if (batch.idempotencyKey === key && batch.employerId === employerId) {
        return { ...batch, items: [...batch.items] };
      }
    }
    return null;
  }

  async listBatches(employerId?: string): Promise<PayrollBatch[]> {
    const list: PayrollBatch[] = [];
    for (const batch of this.storage.batches.values()) {
      if (!employerId || batch.employerId === employerId) {
        list.push({ ...batch, items: [...batch.items] });
      }
    }
    // Sort descending by createdAt
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateBatch(batch: PayrollBatch, event?: AuditEvent): Promise<PayrollBatch> {
    this.storage.batches.set(batch.id, { ...batch });
    if (event) {
      this.storage.auditEvents.push({ ...event });
    }
    return { ...batch, items: [...batch.items] };
  }

  async getAuditEvents(batchId: string): Promise<AuditEvent[]> {
    return this.storage.auditEvents
      .filter((e) => e.batchId === batchId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Testing helper to reset storage
  clear(): void {
    this.storage.batches.clear();
    this.storage.auditEvents = [];
  }
}

export const batchRepository = new PayoutBatchRepository();
