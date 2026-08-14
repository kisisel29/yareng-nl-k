export function PersonCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse bg-cream-100" />
      <div className="mt-3 h-5 w-2/3 animate-pulse bg-cream-100" />
      <div className="mt-2 h-4 w-1/3 animate-pulse bg-cream-100" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-10 md:grid-cols-[16rem_1fr]">
        <div className="aspect-[4/5] animate-pulse bg-cream-100" />
        <div className="space-y-3 pt-2">
          <div className="h-8 w-1/2 animate-pulse bg-cream-100" />
          <div className="h-4 w-full animate-pulse bg-cream-100" />
          <div className="h-4 w-4/5 animate-pulse bg-cream-100" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse bg-cream-100" />
      ))}
    </div>
  );
}
