import { NextRequest, NextResponse } from 'next/server';
import { payoutBatchService } from '@/lib/services/batch-service';
import { ApproveBatchInputSchema } from '@/lib/validation/batch';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parseResult = ApproveBatchInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Approval validation failed',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updated = await payoutBatchService.approveBatch(id, parseResult.data.approverId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Approval failed';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
