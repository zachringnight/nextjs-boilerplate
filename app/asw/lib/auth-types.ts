export type AppRole = 'admin' | 'editor' | 'viewer';

export interface EventRecord {
  id: string;
  slug: string;
  name: string;
}

export interface EventAccess {
  eventId: string;
  eventSlug: string;
  eventName: string;
  role: AppRole;
}

export interface RuntimeAccessContext {
  ready: boolean;
  bypass: boolean;
  userId: string | null;
  eventId: string | null;
  eventSlug: string | null;
  role: AppRole | null;
  hasAccess: boolean;
}
