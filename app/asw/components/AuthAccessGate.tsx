'use client';

import Link from 'next/link';
import { ShieldAlert, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthContext } from './AuthProvider';

function CenterMessage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6 text-center shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1f1f]">
          <ShieldAlert className="h-6 w-6 text-[#FFD100]" />
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-[#9CA3AF]">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}

export default function AuthAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mode, ready, loading, session, hasAccess, error } = useAuthContext();

  if (pathname === '/asw/login') {
    return <>{children}</>;
  }

  if (mode === 'bypass') {
    return <>{children}</>;
  }

  if (!ready || loading) {
    return (
      <CenterMessage
        title="Checking your access"
        description="Please wait while we verify your event permissions."
      />
    );
  }

  if (!session) {
    return (
      <CenterMessage
        title="Sign in required"
        description="This pilot is access-controlled. Sign in to continue."
      >
        <Link
          href="/asw/login"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD100] px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
        >
          <LogIn className="h-4 w-4" />
          Go to Login
        </Link>
      </CenterMessage>
    );
  }

  if (!hasAccess) {
    return (
      <CenterMessage
        title="No event access"
        description={
          error ||
          'Your account is signed in but is not assigned to this event yet. Ask an admin to add you as a member.'
        }
      />
    );
  }

  return <>{children}</>;
}
