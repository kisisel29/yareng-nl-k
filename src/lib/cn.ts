export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900/30 disabled:cursor-not-allowed disabled:opacity-60';

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-sm border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 transition-colors hover:bg-cream-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-800/20 disabled:cursor-not-allowed disabled:opacity-60';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-cream-100 focus:outline-none';

export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-sm bg-red-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

export const inputClass =
  'w-full rounded-sm border border-cream-300 bg-white px-3 py-2.5 text-ink-800 placeholder:text-ink-500/70 focus:border-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900';

export const labelClass = 'mb-1.5 block text-sm font-medium text-ink-700';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
