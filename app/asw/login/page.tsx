'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';

export default function ASWLoginPage() {
  const { mode, loading, session, hasAccess, sendMagicLink, defaultEventSlug } = useAuthContext();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signedInState = useMemo(() => {
    if (!session) return 'signed-out';
    return hasAccess ? 'has-access' : 'no-access';
  }, [hasAccess, session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const result = await sendMagicLink(email.trim());
    if (!result.ok) {
      setError(result.message || 'Failed to send sign-in link.');
      setSubmitting(false);
      return;
    }

    setMessage('Magic link sent. Check your email and return to this page after signing in.');
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Link
        href="/asw"
        className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 text-sm text-[#D1D5DB] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mt-4 rounded-2xl border border-[#2A2A2A] bg-[linear-gradient(140deg,#1a1a1a_0%,#111111_55%,#161616_100%)] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
        <h1 className="text-2xl font-bold text-white">Pilot Sign In</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Use your approved email to access event <span className="font-mono text-[#D1D5DB]">{defaultEventSlug}</span>.
        </p>

        {mode === 'bypass' ? (
          <div className="mt-4 rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] p-3 text-sm text-[#9CA3AF]">
            Auth is bypassed in this environment because Supabase credentials are not configured.
          </div>
        ) : null}

        {signedInState === 'has-access' ? (
          <div className="mt-4 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 p-3 text-sm text-[#86efac]">
            You are signed in and have event access. <Link href="/asw" className="underline">Go to dashboard</Link>.
          </div>
        ) : null}

        {signedInState === 'no-access' ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            You are signed in, but this account is not assigned to the event yet. Ask an admin to add your membership.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Work Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="w-full min-h-[44px] rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] pl-10 pr-3 text-sm text-white placeholder:text-[#6B7280]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading || mode === 'bypass'}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#FFD100] px-4 text-sm font-semibold text-black hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            {submitting ? 'Sending link...' : 'Send Magic Link'}
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-green-300">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
