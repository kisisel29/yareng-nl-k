import type { Person } from '../../types';
import { PersonCard } from './PersonCard';
import { PersonCardSkeleton } from '../ui/Skeleton';

export function PersonGrid({
  people,
  loading,
}: {
  people: Person[];
  loading?: boolean;
}) {
  if (loading) {
    return (
    <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <PersonCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
      <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}
