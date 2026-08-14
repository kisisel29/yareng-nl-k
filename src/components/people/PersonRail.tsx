import { Link } from 'react-router-dom';
import type { Person } from '../../types';
import { formatLifeYears, personName } from '../../lib/format';
import { PersonPlaceholder } from './PersonPlaceholder';
import { SectionTitle } from '../brand/SectionTitle';

interface PersonRailProps {
  eyebrow?: string;
  title: string;
  people: Person[];
  showViews?: boolean;
  actionHref?: string;
  actionLabel?: string;
}

export function PersonRail({
  eyebrow,
  title,
  people,
  showViews = false,
  actionHref,
  actionLabel,
}: PersonRailProps) {
  if (!people.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
      <SectionTitle
        eyebrow={eyebrow}
        title={title}
        action={
          actionHref ? (
            <Link to={actionHref} className="text-sm text-burgundy-700 hover:underline">
              {actionLabel || 'Tümünü gör'}
            </Link>
          ) : null
        }
      />
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {people.map((person) => {
          const name = personName(person);
          const years = formatLifeYears(person.birth_date, person.death_date);
          return (
            <Link
              key={person.id}
              to={`/simalar/${person.slug}`}
              className="w-[78%] shrink-0 snap-start border border-cream-200 bg-white sm:w-auto"
            >
              <article className="flex gap-3 p-3">
                <div className="h-20 w-16 shrink-0 overflow-hidden bg-cream-100">
                  {person.profile_image_url ? (
                    <img src={person.profile_image_url} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <PersonPlaceholder person={person} className="h-full w-full text-[10px]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-ink-500">
                    {person.category?.name || 'Sima'}
                  </p>
                  <h3 className="mt-1 font-serif text-lg leading-snug text-ink-900">{name}</h3>
                  {years ? <p className="mt-1 text-xs text-ink-500">{years}</p> : null}
                  {showViews && typeof person.view_count === 'number' ? (
                    <p className="mt-1 text-xs text-ink-500">{person.view_count} okunma</p>
                  ) : null}
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
