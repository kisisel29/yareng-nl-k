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
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <PersonCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}
