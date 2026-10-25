import { NextRequest, NextResponse } from 'next/server';
import { CreateBatchInputSchema } from '@/lib/validation/batch';
import { payoutBatchService } from '@/lib/services/batch-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employerId = searchParams.get('employerId') || undefined;
    const batches = await payoutBatchService.listBatches(employerId);
    return NextResponse.json({ success: true, data: batches });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateBatchInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await payoutBatchService.createBatch(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        data: result.batch,
        isDuplicate: result.isDuplicate,
      },
      { status: result.isDuplicate ? 200 : 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
