import { Link } from 'react-router-dom';
import type { Person } from '../../types';
import { formatLifeYears, personName } from '../../lib/format';
import { PersonPlaceholder } from './PersonPlaceholder';

export function PersonCard({ person }: { person: Person }) {
  const name = personName(person);
  const years = formatLifeYears(person.birth_date, person.death_date);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-cream-200 bg-white shadow-card">
      <div className="aspect-[4/3] overflow-hidden bg-cream-100">
        {person.profile_image_url ? (
          <img
            src={person.profile_image_url}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <PersonPlaceholder person={person} className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-xl font-semibold text-ink-900">{name}</h3>
        {years ? <p className="mt-1 text-sm text-ink-500">{years}</p> : null}
        {person.category?.name ? (
          <p className="mt-2 text-xs uppercase tracking-wider text-burgundy-700">{person.category.name}</p>
        ) : null}
        {person.short_bio ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">{person.short_bio}</p>
        ) : null}
        <Link
          to={`/simalar/${person.slug}`}
          className="mt-auto pt-4 text-sm font-medium text-burgundy-700 hover:text-burgundy-800"
        >
          Hayatını Oku
        </Link>
      </div>
    </article>
  );
}
