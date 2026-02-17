import { SkeletonBlock } from '../components/Skeleton';

export default function ContractsLoading() {
  return (
    <main className="flex-1 pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
        <SkeletonBlock className="h-8 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-20" />
          ))}
        </div>
      </div>
    </main>
  );
}
