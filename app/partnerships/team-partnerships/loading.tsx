import { SkeletonCard } from '../components/Skeleton';

export default function TeamPartnershipsLoading() {
  return (
    <main className="flex-1 pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
        <div className="h-8 w-48 animate-pulse bg-[#1A1A1A] rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </main>
  );
}
