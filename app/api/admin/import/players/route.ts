import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminContext } from '../_lib/auth';
import {
  importPayloadSchema,
  parseBoolean,
  parseCsv,
  splitList,
  summarizeDiff,
  toNullable,
} from '../_lib/csv';
import { assertImportSchema } from '../_lib/schema';

const playerRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  pronunciation: z.string().nullable(),
  team: z.string().nullable(),
  team_abbr: z.string().nullable(),
  position: z.string().nullable(),
  day: z.number().int().min(1).max(2).nullable(),
  scheduled_time: z.string().nullable(),
  nationality: z.string().nullable(),
  flag: z.string().nullable(),
  jersey_number: z.number().int().min(0).nullable(),
  photo: z.string().nullable(),
  embargoed: z.boolean(),
  translator_needed: z.boolean(),
  notes: z.array(z.string()),
  bio: z.array(z.string()),
  talking_points: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const schemaCheck = await assertImportSchema(auth.supabase, 'players');
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
  const normalizedRows: Array<z.infer<typeof playerRowSchema>> = [];

  parsedCsv.rows.forEach((row, index) => {
    const parsedDay = toNullable(row.day);
    const parsedJersey = toNullable(row.jersey_number);

    const candidate = {
      id: row.id?.trim() ?? '',
      name: row.name?.trim() ?? '',
      first_name: toNullable(row.first_name),
      last_name: toNullable(row.last_name),
      pronunciation: toNullable(row.pronunciation),
      team: toNullable(row.team),
      team_abbr: toNullable(row.team_abbr),
      position: toNullable(row.position),
      day: parsedDay ? Number(parsedDay) : null,
      scheduled_time: toNullable(row.scheduled_time),
      nationality: toNullable(row.nationality),
      flag: toNullable(row.flag),
      jersey_number: parsedJersey ? Number(parsedJersey) : null,
      photo: toNullable(row.photo),
      embargoed: parseBoolean(row.embargoed),
      translator_needed: parseBoolean(row.translator_needed),
      notes: splitList(row.notes),
      bio: splitList(row.bio),
      talking_points: splitList(row.talking_points),
    };

    const result = playerRowSchema.safeParse(candidate);
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
        .from('players')
        .select('id')
        .eq('event_id', auth.ctx.eventId)
        .in('id', ids)
    : { data: [], error: null };

  if (existingError) {
    return NextResponse.json(
      { error: `Failed to read existing players: ${existingError.message}` },
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

  const timestamp = new Date().toISOString();
  const upsertRows = normalizedRows.map((row) => ({
    event_id: auth.ctx.eventId,
    id: row.id,
    name: row.name,
    first_name: row.first_name,
    last_name: row.last_name,
    pronunciation: row.pronunciation,
    team: row.team,
    team_abbr: row.team_abbr,
    position: row.position,
    day: row.day,
    scheduled_time: row.scheduled_time,
    nationality: row.nationality,
    flag: row.flag,
    jersey_number: row.jersey_number,
    photo: row.photo,
    embargoed: row.embargoed,
    translator_needed: row.translator_needed,
    notes: row.notes,
    bio: row.bio,
    talking_points: row.talking_points,
    created_by_user_id: auth.ctx.userId,
    updated_at: timestamp,
  }));

  const { error: upsertError } = await auth.supabase
    .from('players')
    .upsert(upsertRows, { onConflict: 'event_id,id' });

  if (upsertError) {
    return NextResponse.json(
      { error: `Failed to import players: ${upsertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    mode: 'commit',
    event: auth.ctx,
    ...diff,
  });
}
