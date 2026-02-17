import { describe, expect, it } from 'vitest';
import {
  createClientUuid,
  ensureUuid,
  isUuid,
  stableUuidFromString,
} from '../id-utils';

describe('id-utils', () => {
  it('stableUuidFromString returns deterministic UUID values', () => {
    const first = stableUuidFromString('player:alpha');
    const second = stableUuidFromString('player:alpha');

    expect(first).toBe(second);
    expect(isUuid(first)).toBe(true);
  });

  it('createClientUuid uses deterministic output when a seed is provided', () => {
    const first = createClientUuid('deliverable:seed');
    const second = createClientUuid('deliverable:seed');

    expect(first).toBe(second);
    expect(isUuid(first)).toBe(true);
  });

  it('ensureUuid preserves valid UUID input', () => {
    const input = 'f5d3d7fc-3a6f-4d95-b3dc-8f4307775a12';
    expect(ensureUuid(input, 'note')).toBe(input);
  });

  it('ensureUuid converts non-UUID input deterministically', () => {
    const first = ensureUuid('legacy-deliverable-id', 'deliverable');
    const second = ensureUuid('legacy-deliverable-id', 'deliverable');

    expect(first).toBe(second);
    expect(isUuid(first)).toBe(true);
  });
});
