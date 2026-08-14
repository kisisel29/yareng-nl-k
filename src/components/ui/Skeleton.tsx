export function PersonCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-cream-200 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-cream-200" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-2/3 animate-pulse rounded bg-cream-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-cream-100" />
        <div className="h-16 w-full animate-pulse rounded bg-cream-100" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="aspect-[16/9] animate-pulse rounded-lg bg-cream-200 sm:aspect-[21/9]" />
      <div className="mt-8 h-10 w-1/2 animate-pulse rounded bg-cream-200" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-cream-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-cream-100" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-cream-100" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-md bg-cream-100" />
      ))}
    </div>
  );
}
