import type { AppRole, RuntimeAccessContext } from './auth-types';

const defaultContext: RuntimeAccessContext = {
  ready: false,
  bypass: false,
  userId: null,
  eventId: null,
  eventSlug: null,
  role: null,
  hasAccess: false,
};

let runtimeContext: RuntimeAccessContext = { ...defaultContext };

export function setRuntimeAccessContext(next: Partial<RuntimeAccessContext>): void {
  runtimeContext = {
    ...runtimeContext,
    ...next,
  };
}

export function resetRuntimeAccessContext(): void {
  runtimeContext = { ...defaultContext };
}

export function getRuntimeAccessContext(): RuntimeAccessContext {
  return runtimeContext;
}

export function canWriteRole(role: AppRole | null | undefined): boolean {
  return role === 'admin' || role === 'editor';
}

export function canAdminRole(role: AppRole | null | undefined): boolean {
  return role === 'admin';
}
