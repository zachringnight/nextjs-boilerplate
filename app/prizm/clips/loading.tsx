import { HeaderSkeleton, Skeleton } from '../components/Skeleton';

export default function ClipsLoading() {
  return (
    <div>
      <HeaderSkeleton />
      {/* Stats bar */}
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Quick mark */}
      <div className="px-4 py-4 bg-[#0D0D0D] border-b border-[#2A2A2A]">
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      {/* Clip list */}
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
