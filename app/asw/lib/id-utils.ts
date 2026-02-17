const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fnv1a32(input: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hex32(value: number): string {
  return (value >>> 0).toString(16).padStart(8, '0');
}

export function isUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return UUID_V4_REGEX.test(value);
}

export function stableUuidFromString(input: string): string {
  const segment1 = hex32(fnv1a32(input, 0x811c9dc5));
  const segment2 = hex32(fnv1a32(input, 0x9e3779b1));
  const segment3 = hex32(fnv1a32(input, 0x85ebca6b));
  const segment4 = hex32(fnv1a32(input, 0xc2b2ae35));

  const hex = `${segment1}${segment2}${segment3}${segment4}`.slice(0, 32).split('');

  // Force UUIDv5-ish shape for deterministic IDs.
  hex[12] = '5';
  const variant = parseInt(hex[16], 16);
  hex[16] = ((variant & 0x3) | 0x8).toString(16);

  const normalized = hex.join('');
  return [
    normalized.slice(0, 8),
    normalized.slice(8, 12),
    normalized.slice(12, 16),
    normalized.slice(16, 20),
    normalized.slice(20, 32),
  ].join('-');
}

export function createClientUuid(seed?: string): string {
  if (seed && seed.trim().length > 0) {
    return stableUuidFromString(seed);
  }

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return stableUuidFromString(`fallback-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`);
}

export function ensureUuid(value: string, seedPrefix = 'asw'): string {
  if (isUuid(value)) return value;
  return stableUuidFromString(`${seedPrefix}:${value}`);
}
