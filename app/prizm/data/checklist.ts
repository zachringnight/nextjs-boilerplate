/**
 * Default Production Checklist for Prizm Lounge
 * Cleared — production to-do items removed.
 */

import { ChecklistItem } from '../types';

export const defaultChecklist: ChecklistItem[] = [];

/**
 * Get checklist items for a specific day
 */
export function getChecklistForDay(day: string): ChecklistItem[] {
  return defaultChecklist.filter((item) => item.dueDay === day);
}

/**
 * Get checklist items for a specific category
 */
export function getChecklistForCategory(category: string): ChecklistItem[] {
  return defaultChecklist.filter((item) => item.category === category);
}
