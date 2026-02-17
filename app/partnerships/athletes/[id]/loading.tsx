import { SkeletonBlock } from '../../components/Skeleton';

export default function AthleteDetailLoading() {
  return (
    <main className="flex-1 pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-10 w-64" />
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-48" />
      </div>
    </main>
  );
}
