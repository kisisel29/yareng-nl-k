import { Link } from 'react-router-dom';
import type { Person } from '../../types';
import { formatLifeYears, personName } from '../../lib/format';
import { PersonPlaceholder } from './PersonPlaceholder';

export function PersonCard({ person }: { person: Person }) {
  const name = personName(person);
  const years = formatLifeYears(person.birth_date, person.death_date);

  return (
    <Link to={`/simalar/${person.slug}`} className="group block">
      <article>
        <div className="aspect-[4/5] overflow-hidden bg-cream-100">
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
        <div className="pt-3">
          {person.category?.name ? (
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">{person.category.name}</p>
          ) : null}
          <h3 className="mt-1 font-serif text-xl leading-snug text-ink-900 group-hover:underline">
            {name}
          </h3>
          {years ? <p className="mt-1 text-sm text-ink-500">{years}</p> : null}
          {person.short_bio ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-600">{person.short_bio}</p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
