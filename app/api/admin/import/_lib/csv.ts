import { z } from 'zod';

const MAX_CSV_SIZE = 5 * 1024 * 1024; // 5 MB

export const importPayloadSchema = z.object({
  csv: z.string().min(1, 'CSV content is required.').max(MAX_CSV_SIZE, `CSV content must be under ${MAX_CSV_SIZE / 1024 / 1024} MB.`),
  dryRun: z.boolean().optional().default(true),
});

export type ImportPayload = z.infer<typeof importPayloadSchema>;

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

export function parseCsv(text: string): ParsedCsv {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) {
    return { headers: [], rows: [] };
  }

  const lines = normalized.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });

  return { headers, rows };
}

export function toNullable(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function splitList(value: string | null | undefined): string[] {
  const normalized = toNullable(value);
  if (!normalized) return [];

  if (normalized.includes('|')) {
    return normalized.split('|').map((item) => item.trim()).filter(Boolean);
  }

  if (normalized.includes(';')) {
    return normalized.split(';').map((item) => item.trim()).filter(Boolean);
  }

  return [normalized];
}

export function parseBoolean(value: string | null | undefined): boolean {
  const normalized = toNullable(value)?.toLowerCase();
  if (!normalized) return false;
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y';
}

export function summarizeDiff(ids: string[], existingIds: Set<string>) {
  let toInsert = 0;
  let toUpdate = 0;

  for (const id of ids) {
    if (existingIds.has(id)) {
      toUpdate += 1;
    } else {
      toInsert += 1;
    }
  }

  return {
    totalRows: ids.length,
    inserts: toInsert,
    updates: toUpdate,
  };
}
