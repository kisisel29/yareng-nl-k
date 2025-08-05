import React from 'react';
import { Mail, Heart } from 'lucide-react';
import { DiarySection } from './DiarySection';

interface WeeklyLetterSectionProps {
  letter: string;
  onLetterChange: (letter: string) => void;
  isWeekly: boolean;
}

export const WeeklyLetterSection: React.FC<WeeklyLetterSectionProps> = ({
  letter,
  onLetterChange,
  isWeekly
}) => {
  if (!isWeekly) return null;

  return (
    <DiarySection title="💌 Yaren'den Yaren'e Mektup" icon={Mail} className="bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="space-y-4">
        <div className="text-center">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className="text-pink-700 font-medium">
            Gelecek haftaki kendine bir mektup yaz! 💕
          </p>
        </div>
        
        <div>
          <label className="block text-pink-700 font-medium mb-2">
            Sevgili gelecekteki Yaren,
          </label>
          <textarea
            value={letter}
            onChange={(e) => onLetterChange(e.target.value)}
            placeholder="Merhaba gelecekteki Yaren! Bu hafta nasıldı, gelecek hafta için neler umuyorum..."
            className="w-full bg-pink-50 border-2 border-pink-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 transition-all duration-300 resize-none"
            rows={6}
          />
          <p className="text-right text-pink-600 font-medium mt-2">
            Sevgilerle, bugünkü Yaren 💖
          </p>
        </div>
      </div>
    </DiarySection>
  );
};