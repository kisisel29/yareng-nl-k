import React from 'react';
import { BookOpen } from 'lucide-react';
import { DiarySection } from './DiarySection';

interface ReadingSectionProps {
  bookName: string;
  impactfulQuote: string;
  whyInteresting: string;
  onBookNameChange: (value: string) => void;
  onImpactfulQuoteChange: (value: string) => void;
  onWhyInterestingChange: (value: string) => void;
}

export const ReadingSection: React.FC<ReadingSectionProps> = ({
  bookName,
  impactfulQuote,
  whyInteresting,
  onBookNameChange,
  onImpactfulQuoteChange,
  onWhyInterestingChange
}) => {
  return (
    <DiarySection title="📖 Ne Okudum?" icon={BookOpen}>
      <div className="space-y-4">
        <div>
          <label className="block text-blue-700 font-medium mb-2">
            Kitap veya yazı adı:
          </label>
          <input
            type="text"
            value={bookName}
            onChange={(e) => onBookNameChange(e.target.value)}
            placeholder="Kitap veya yazı adını yazın..."
            className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-blue-700 font-medium mb-2">
            Etkileyen cümle:
          </label>
          <textarea
            value={impactfulQuote}
            onChange={(e) => onImpactfulQuoteChange(e.target.value)}
            placeholder="Beni etkileyen bir cümle..."
            className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-blue-700 font-medium mb-2">
            Neden ilgimi çekti?
          </label>
          <textarea
            value={whyInteresting}
            onChange={(e) => onWhyInterestingChange(e.target.value)}
            placeholder="Bu kitap/yazı neden ilgimi çekti..."
            className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
            rows={3}
          />
        </div>
      </div>
    </DiarySection>
  );
};