import { Link } from 'react-router-dom';
import { TURKISH_ALPHABET } from '../../lib/constants';
import { cn } from '../../lib/cn';

interface AlphabetIndexProps {
  activeLetter?: string;
  onSelect?: (letter: string) => void;
}

export function AlphabetIndex({ activeLetter = '', onSelect }: AlphabetIndexProps) {
  return (
    <nav aria-label="Soyada göre A–Z dizin" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
      <ul className="flex w-max gap-1 sm:w-full sm:flex-wrap sm:justify-center">
        {TURKISH_ALPHABET.map((letter) => {
          const active = activeLetter === letter;
          const className = cn(
            'flex h-10 min-w-10 items-center justify-center rounded-sm px-2 text-sm',
            active ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-cream-100'
          );

          if (onSelect) {
            return (
              <li key={letter}>
                <button type="button" className={className} onClick={() => onSelect(active ? '' : letter)}>
                  {letter}
                </button>
              </li>
            );
          }

          return (
            <li key={letter}>
              <Link to={`/simalar?harf=${encodeURIComponent(letter)}`} className={className}>
                {letter}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
