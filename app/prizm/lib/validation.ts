/**
 * Zod validation schemas for Prizm Lounge data
 * Ensures data integrity at runtime
 */

import { z } from 'zod';

// Station ID enum
export const StationIdSchema = z.enum(['ledWall', 'signing', 'packRip', 'prCall', 'free']);

// Day date enum (event dates)
export const DayDateSchema = z.enum(['2026-02-05', '2026-02-06', '2026-02-07']);

// Time string validation (HH:MM format)
export const TimeStringSchema = z.string().regex(
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Time must be in HH:MM format'
);

// Date string validation (YYYY-MM-DD format)
export const DateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
);

// Player schema
export const PlayerSchema = z.object({
  id: z.string().min(1, 'Player ID is required'),
  name: z.string().min(1, 'Player name is required'),
  team: z.string().min(1, 'Team is required'),
  position: z.string().min(1, 'Position is required'),
  photo: z.string(),
  bio: z.string(),
  stats: z.array(z.string()),
  cardHistory: z.array(z.string()),
  moments: z.array(z.string()),
  signingOnly: z.boolean().optional(),
});

// PR Call Info schema
export const PRCallInfoSchema = z.object({
  outlet: z.string().min(1, 'Outlet name is required'),
  contact: z.string().optional(),
  callIn: z.string().optional(),
  notes: z.string().optional(),
});

// Schedule slot status
export const SlotStatusSchema = z.enum(['scheduled', 'cancelled', 'tbd']);

// Schedule slot schema
export const ScheduleSlotSchema = z.object({
  id: z.string().min(1, 'Slot ID is required'),
  playerId: z.string().min(1, 'Player ID is required'),
  date: DateStringSchema,
  startTime: TimeStringSchema,
  endTime: TimeStringSchema,
  station: StationIdSchema,
  status: SlotStatusSchema.optional().default('scheduled'),
  prCallInfo: PRCallInfoSchema.optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // End time should be after start time (unless both are 00:00 for TBD slots)
    if (data.startTime === '00:00' && data.endTime === '00:00') {
      return true; // TBD slots are allowed
    }
    return data.endTime > data.startTime;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

// Station schema
export const StationSchema = z.object({
  id: StationIdSchema,
  name: z.string().min(1),
  icon: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
  questions: z.array(z.string()).min(1, 'At least one question is required'),
});

// Arrays
export const PlayersArraySchema = z.array(PlayerSchema);
export const ScheduleArraySchema = z.array(ScheduleSlotSchema);
export const StationsArraySchema = z.array(StationSchema);

// Validation result type
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: z.ZodError;
};

/**
 * Validate data against a schema with proper error handling
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Validate player data
 */
export function validatePlayer(data: unknown) {
  return validate(PlayerSchema, data);
}

/**
 * Validate schedule slot data
 */
export function validateScheduleSlot(data: unknown) {
  return validate(ScheduleSlotSchema, data);
}

/**
 * Validate entire schedule array
 */
export function validateSchedule(data: unknown) {
  return validate(ScheduleArraySchema, data);
}

/**
 * Validate all players
 */
export function validatePlayers(data: unknown) {
  return validate(PlayersArraySchema, data);
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: z.ZodError): string[] {
  return errors.issues.map((issue: z.ZodIssue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

// Type exports inferred from schemas
export type ValidatedPlayer = z.infer<typeof PlayerSchema>;
export type ValidatedScheduleSlot = z.infer<typeof ScheduleSlotSchema>;
export type ValidatedStation = z.infer<typeof StationSchema>;
export type ValidatedPRCallInfo = z.infer<typeof PRCallInfoSchema>;
export type ValidatedStationId = z.infer<typeof StationIdSchema>;
export type ValidatedDayDate = z.infer<typeof DayDateSchema>;
