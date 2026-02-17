import type { SupabaseClient } from '@supabase/supabase-js';

export type ImportSchemaTarget = 'players' | 'schedule' | 'deliverables';

interface SchemaCheckResult {
  ok: boolean;
  message?: string;
}

function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string };
  if (e.code === '42703') return true;
  return /column .* does not exist/i.test(e.message || '');
}

async function probeColumns(
  supabase: SupabaseClient,
  table: string,
  columns: string[]
): Promise<SchemaCheckResult> {
  const { error } = await supabase
    .from(table)
    .select(columns.join(','))
    .limit(1);

  if (!error) return { ok: true };

  if (isMissingColumnError(error)) {
    return {
      ok: false,
      message: `Supabase schema is missing required columns on "${table}" (${columns.join(', ')}).`,
    };
  }

  return {
    ok: false,
    message: `Failed to validate "${table}" schema: ${error.message}`,
  };
}

export async function assertImportSchema(
  supabase: SupabaseClient,
  target: ImportSchemaTarget
): Promise<SchemaCheckResult> {
  // Baseline: import pipeline requires event-scoped tables.
  const commonChecks: Array<[table: string, columns: string[]]> = [
    ['events', ['id', 'slug', 'name']],
    ['event_members', ['event_id', 'user_id', 'role']],
  ];

  let targetChecks: Array<[table: string, columns: string[]]> = [];

  if (target === 'players') {
    targetChecks = [
      [
        'players',
        [
          'event_id',
          'id',
          'name',
          'first_name',
          'last_name',
          'day',
          'scheduled_time',
          'embargoed',
          'translator_needed',
          'updated_at',
        ],
      ],
    ];
  } else if (target === 'schedule') {
    targetChecks = [
      [
        'schedule_slots',
        [
          'id',
          'event_id',
          'player_id',
          'date',
          'start_time',
          'end_time',
          'station',
          'status',
          'notes',
          'pr_call_info',
        ],
      ],
    ];
  } else {
    targetChecks = [
      [
        'deliverables',
        [
          'id',
          'event_id',
          'title',
          'description',
          'type',
          'status',
          'due_day',
          'player_id',
          'priority',
        ],
      ],
    ];
  }

  for (const [table, columns] of [...commonChecks, ...targetChecks]) {
    const result = await probeColumns(supabase, table, columns);
    if (!result.ok) {
      return {
        ok: false,
        message: `${result.message} CSV import requires the upgraded event-scoped schema.`,
      };
    }
  }

  return { ok: true };
}
