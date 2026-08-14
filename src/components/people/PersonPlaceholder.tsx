import type { Person } from '../../types';

export function PersonPlaceholder({ person, className = '' }: { person?: Person; className?: string }) {
  const initials = person
    ? `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`.toUpperCase()
    : 'GS';

  return (
    <div className={`flex items-center justify-center bg-cream-100 text-ink-500 ${className}`} aria-hidden>
      <span className="font-serif text-4xl">{initials}</span>
    </div>
  );
}
