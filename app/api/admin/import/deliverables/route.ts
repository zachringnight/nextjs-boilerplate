import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminContext } from '../_lib/auth';
import {
  importPayloadSchema,
  parseCsv,
  summarizeDiff,
  toNullable,
} from '../_lib/csv';

const deliverableStatusSchema = z.enum(['pending', 'in-progress', 'completed', 'delivered']);
const deliverableTypeSchema = z.enum(['photo', 'video']);

const deliverableRowSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  type: deliverableTypeSchema,
  status: deliverableStatusSchema,
  player_id: z.string().nullable(),
  due_day: z.string().min(1),
  completed_at: z.string().datetime().nullable(),
  delivered_at: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  assignee: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']).nullable(),
});

function normalizeIso(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
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
  const normalizedRows: Array<z.infer<typeof deliverableRowSchema>> = [];

  parsedCsv.rows.forEach((row, index) => {
    const candidate = {
      id: row.id?.trim() ?? '',
      title: row.title?.trim() ?? '',
      description: toNullable(row.description),
      type: (row.type || 'video').trim().toLowerCase(),
      status: (row.status || 'pending').trim().toLowerCase(),
      player_id: toNullable(row.player_id),
      due_day: row.due_day?.trim() ?? '',
      completed_at: normalizeIso(toNullable(row.completed_at)),
      delivered_at: normalizeIso(toNullable(row.delivered_at)),
      notes: toNullable(row.notes),
      assignee: toNullable(row.assignee),
      priority: (toNullable(row.priority)?.toLowerCase() as 'low' | 'medium' | 'high' | null),
    };

    const result = deliverableRowSchema.safeParse(candidate);
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
        .from('deliverables')
        .select('id')
        .eq('event_id', auth.ctx.eventId)
        .in('id', ids)
    : { data: [], error: null };

  if (existingError) {
    return NextResponse.json(
      { error: `Failed to read existing deliverables: ${existingError.message}` },
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
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    player_id: row.player_id,
    due_day: row.due_day,
    completed_at: row.completed_at,
    delivered_at: row.delivered_at,
    notes: row.notes,
    assignee: row.assignee,
    priority: row.priority,
    created_by_user_id: auth.ctx.userId,
  }));

  const { error: upsertError } = await auth.supabase
    .from('deliverables')
    .upsert(upsertRows, { onConflict: 'id' });

  if (upsertError) {
    return NextResponse.json(
      { error: `Failed to import deliverables: ${upsertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    mode: 'commit',
    event: auth.ctx,
    ...diff,
  });
}
