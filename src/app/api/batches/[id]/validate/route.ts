import { NextRequest, NextResponse } from 'next/server';
import { payoutBatchService } from '@/lib/services/batch-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const actorId = body.actorId || 'employer_admin_demo';

    const updated = await payoutBatchService.validateBatch(id, actorId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Validation failed';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
