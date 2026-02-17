import { describe, expect, it } from 'vitest';
import {
  fromLegacyClipStation,
  fromLegacyTimestamp,
  toLegacyClipStation,
  toLegacyTimestamp,
} from '../schema-compat';

describe('schema-compat', () => {
  it('maps ASW clip stations to legacy station names', () => {
    expect(toLegacyClipStation('tunnel')).toBe('LED Wall');
    expect(toLegacyClipStation('product')).toBe('Signing');
    expect(toLegacyClipStation('unknown')).toBe('Free');
    expect(toLegacyClipStation(null)).toBe('Free');
  });

  it('maps legacy clip stations back to ASW station ids', () => {
    expect(fromLegacyClipStation('LED Wall')).toBe('tunnel');
    expect(fromLegacyClipStation('Signing')).toBe('product');
    expect(fromLegacyClipStation('Free')).toBeNull();
    expect(fromLegacyClipStation(null)).toBeNull();
  });

  it('converts legacy timestamps from seconds and milliseconds to ISO', () => {
    expect(fromLegacyTimestamp(1_700_000_000)).toBe('2023-11-14T22:13:20.000Z');
    expect(fromLegacyTimestamp(1_700_000_000_000)).toBe('2023-11-14T22:13:20.000Z');
  });

  it('converts ISO timestamps to legacy milliseconds', () => {
    expect(toLegacyTimestamp('2024-01-01T00:00:00.000Z')).toBe(1_704_067_200_000);
  });
});
