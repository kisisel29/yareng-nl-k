import { Search } from 'lucide-react';
import { cn, inputClass } from '../../lib/cn';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  large?: boolean;
  onSubmit?: () => void;
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'Bir isim ara...',
  large = false,
  onSubmit,
}: SearchBoxProps) {
  return (
    <form
      className="relative w-full"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, 'pl-12', large && 'py-4 text-lg')}
        autoComplete="off"
      />
    </form>
  );
}
