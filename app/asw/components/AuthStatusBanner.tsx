'use client';

import Link from 'next/link';
import { LogIn, LogOut, Shield, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuthContext } from './AuthProvider';

function RolePill({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${colorClass}`}>
      {label}
    </span>
  );
}

export default function AuthStatusBanner() {
  const { mode, loading, session, access, hasAccess, role, signOut } = useAuthContext();

  if (mode === 'bypass') {
    return (
      <div className="border-b border-[#2A2A2A] bg-[#111111] px-4 py-2 text-xs text-[#9CA3AF]">
        Local mode: Supabase auth is not configured. Running with bypass access for development.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-b border-[#2A2A2A] bg-[#111111] px-4 py-2 text-xs text-[#9CA3AF]">
        Checking sign-in and access permissions...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          Sign in is required for this pilot.
        </div>
        <Link href="/asw/login" className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline">
          <LogIn className="h-3.5 w-3.5" />
          Login
        </Link>
      </div>
    );
  }

  if (!hasAccess || !access) {
    return (
      <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
        Your account is signed in but not assigned to this event.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-[#2A2A2A] bg-[#111111] px-4 py-2 text-xs text-[#D1D5DB]">
      <div className="flex items-center gap-2">
        <UserCheck className="h-3.5 w-3.5 text-[#22c55e]" />
        <span className="truncate">{access.eventName}</span>
        <span className="text-[#6B7280]">({access.eventSlug})</span>
        {role === 'admin' ? <RolePill label="Admin" colorClass="border-cyan-400/40 bg-cyan-500/10 text-cyan-300" /> : null}
        {role === 'editor' ? <RolePill label="Editor" colorClass="border-blue-400/40 bg-blue-500/10 text-blue-300" /> : null}
        {role === 'viewer' ? <RolePill label="Viewer" colorClass="border-zinc-400/40 bg-zinc-500/10 text-zinc-200" /> : null}
        {role === 'viewer' ? (
          <span className="inline-flex items-center gap-1 text-[#9CA3AF]">
            <Shield className="h-3.5 w-3.5" />
            Read-only mode
          </span>
        ) : null}
      </div>
      <button
        onClick={() => void signOut()}
        className="inline-flex items-center gap-1 text-[#9CA3AF] hover:text-white"
        aria-label="Sign out"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </div>
  );
}
