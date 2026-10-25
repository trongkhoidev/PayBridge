import { NextResponse } from 'next/server';
import { payoutBatchService } from '@/lib/services/batch-service';
import { batchRepository } from '@/lib/repositories/batch-repository';

export async function GET() {
  try {
    const batches = await payoutBatchService.listBatches();
    const allEvents = [];

    for (const batch of batches) {
      const events = await batchRepository.getAuditEvents(batch.id);
      allEvents.push(...events.map((e) => ({ ...e, batchTitle: batch.title })));
    }

    // Sort descending by creation date
    allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: allEvents });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch audit events';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
