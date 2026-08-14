export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border border-cream-200 px-6 py-16 text-center">
      <p className="font-serif text-2xl text-ink-800">{title}</p>
      {description ? <p className="mt-2 text-sm text-ink-500">{description}</p> : null}
    </div>
  );
}
