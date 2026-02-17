'use client';

export default function PartnershipsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full">
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-[#9CA3AF] text-sm mb-4 text-center max-w-md">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#FFD100] text-black font-medium rounded-lg text-sm"
      >
        Try again
      </button>
    </div>
  );
}
