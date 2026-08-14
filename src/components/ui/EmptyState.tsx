export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-cream-300 bg-white px-6 py-14 text-center">
      <p className="font-serif text-2xl text-ink-800">{title}</p>
      {description ? <p className="mt-2 text-sm text-ink-500">{description}</p> : null}
    </div>
  );
}
