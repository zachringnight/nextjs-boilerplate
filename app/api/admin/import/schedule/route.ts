import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminContext } from '../_lib/auth';
import {
  importPayloadSchema,
  parseCsv,
  summarizeDiff,
  toNullable,
} from '../_lib/csv';
import { assertImportSchema } from '../_lib/schema';

const timePattern = /^\d{2}:\d{2}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const scheduleRowSchema = z.object({
  id: z.string().min(1),
  player_id: z.string().min(1),
  date: z.string().regex(datePattern),
  start_time: z.string().regex(timePattern),
  end_time: z.string().regex(timePattern),
  station: z.string().min(1),
  status: z.string().nullable(),
  notes: z.string().nullable(),
  pr_call_info: z.record(z.string(), z.unknown()).nullable(),
});

function parsePrCallInfo(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const schemaCheck = await assertImportSchema(auth.supabase, 'schedule');
  if (!schemaCheck.ok) {
    return NextResponse.json({ error: schemaCheck.message }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsedPayload = importPayloadSchema.safeParse(body);
  if (!parsedPayload.success) {
    return NextResponse.json(
      { error: parsedPayload.error.issues.map((issue) => issue.message).join(' ') },
      { status: 400 }
    );
  }

  const { csv, dryRun } = parsedPayload.data;
  const parsedCsv = parseCsv(csv);
  if (parsedCsv.rows.length === 0) {
    return NextResponse.json({ error: 'CSV has no data rows.' }, { status: 400 });
  }

  const validationErrors: Array<{ row: number; message: string }> = [];
  const normalizedRows: Array<z.infer<typeof scheduleRowSchema>> = [];

  parsedCsv.rows.forEach((row, index) => {
    const candidate = {
      id: row.id?.trim() ?? '',
      player_id: row.player_id?.trim() ?? '',
      date: row.date?.trim() ?? '',
      start_time: row.start_time?.trim() ?? '',
      end_time: row.end_time?.trim() ?? '',
      station: row.station?.trim() ?? '',
      status: toNullable(row.status),
      notes: toNullable(row.notes),
      pr_call_info: parsePrCallInfo(toNullable(row.pr_call_info)),
    };

    const result = scheduleRowSchema.safeParse(candidate);
    if (!result.success) {
      validationErrors.push({
        row: index + 2,
        message: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
      });
      return;
    }

    normalizedRows.push(result.data);
  });

  if (validationErrors.length > 0) {
    return NextResponse.json(
      {
        error: 'CSV validation failed.',
        issues: validationErrors.slice(0, 50),
      },
      { status: 400 }
    );
  }

  const ids = Array.from(new Set(normalizedRows.map((row) => row.id)));

  const { data: existingRows, error: existingError } = ids.length
    ? await auth.supabase
        .from('schedule_slots')
        .select('id')
        .eq('event_id', auth.ctx.eventId)
        .in('id', ids)
    : { data: [], error: null };

  if (existingError) {
    return NextResponse.json(
      { error: `Failed to read existing schedule rows: ${existingError.message}` },
      { status: 500 }
    );
  }

  const existingSet = new Set((existingRows || []).map((row) => row.id as string));
  const diff = summarizeDiff(ids, existingSet);

  if (dryRun) {
    return NextResponse.json({
      mode: 'dry-run',
      event: auth.ctx,
      ...diff,
    });
  }

  const upsertRows = normalizedRows.map((row) => ({
    id: row.id,
    event_id: auth.ctx.eventId,
    player_id: row.player_id,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    station: row.station,
    status: row.status,
    notes: row.notes,
    pr_call_info: row.pr_call_info,
    created_by_user_id: auth.ctx.userId,
  }));

  const { error: upsertError } = await auth.supabase
    .from('schedule_slots')
    .upsert(upsertRows, { onConflict: 'id' });

  if (upsertError) {
    return NextResponse.json(
      { error: `Failed to import schedule: ${upsertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    mode: 'commit',
    event: auth.ctx,
    ...diff,
  });
}
