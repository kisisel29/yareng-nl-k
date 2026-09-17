import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';
import {
  emptyReactions,
  fetchContentReactions,
  readStoredReaction,
  submitContentReaction,
  type ReactionCounts,
  type ReactionKey,
} from '../../lib/api';

const OPTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: 'love', emoji: '❤️', label: 'Beğen' },
  { key: 'dislike', emoji: '👎', label: 'Beğenme' },
  { key: 'laugh', emoji: '😂', label: 'Gül' },
  { key: 'sad', emoji: '😢', label: 'Üzül' },
  { key: 'angry', emoji: '😠', label: 'Kızgın' },
  { key: 'wow', emoji: '😮', label: 'Şaşır' },
];

export function ReactionBar({ targetKey }: { targetKey: string }) {
  const [counts, setCounts] = useState<ReactionCounts>(emptyReactions);
  const [selected, setSelected] = useState<ReactionKey | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setSelected(readStoredReaction(targetKey));
    fetchContentReactions(targetKey)
      .then((next) => {
        if (active) setCounts(next);
      })
      .catch(() => {
        if (active) setCounts(emptyReactions());
      });
    return () => {
      active = false;
    };
  }, [targetKey]);

  const onReact = async (reaction: ReactionKey) => {
    if (busy) return;
    const previous = selected;
    const optimistic = previous === reaction ? null : reaction;
    setBusy(true);
    setSelected(optimistic);
    setCounts((current) => {
      const next = { ...current };
      if (previous === reaction) {
        next[reaction] = Math.max(0, next[reaction] - 1);
      } else {
        if (previous) next[previous] = Math.max(0, next[previous] - 1);
        next[reaction] += 1;
      }
      return next;
    });
    try {
      const next = await submitContentReaction(targetKey, reaction, previous);
      setCounts(next);
      setSelected(readStoredReaction(targetKey));
    } catch {
      setSelected(previous);
      const restored = await fetchContentReactions(targetKey).catch(() => emptyReactions());
      setCounts(restored);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 border-t border-cream-200 pt-8">
      <div className="grid grid-cols-6 gap-2 sm:gap-4">
        {OPTIONS.map((option) => {
          const active = selected === option.key;
          return (
            <button
              key={option.key}
              type="button"
              disabled={busy}
              onClick={() => void onReact(option.key)}
              aria-pressed={active}
              aria-label={option.label}
              className={cn(
                'flex flex-col items-center gap-2 border-b border-cream-300 pb-3 transition',
                active ? 'scale-110 border-ink-800' : 'opacity-90 hover:opacity-100',
                busy && 'cursor-wait'
              )}
            >
              <span className="text-3xl leading-none sm:text-4xl" aria-hidden>
                {option.emoji}
              </span>
              <span className="text-sm text-ink-700">{counts[option.key]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
