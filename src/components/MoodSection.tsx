import React from 'react';
import { Heart } from 'lucide-react';
import { DiarySection } from './DiarySection';

interface MoodSectionProps {
  mood: string;
  moodDescription: string;
  onMoodChange: (mood: string) => void;
  onMoodDescriptionChange: (description: string) => void;
}

const moodOptions = [
  { emoji: '😊', label: 'Çok Mutlu' },
  { emoji: '🙂', label: 'Mutlu' },
  { emoji: '😐', label: 'Normal' },
  { emoji: '😔', label: 'Üzgün' },
  { emoji: '😴', label: 'Yorgun' },
  { emoji: '😎', label: 'Havalı' },
  { emoji: '🤔', label: 'Düşünceli' },
  { emoji: '😌', label: 'Huzurlu' }
];

export const MoodSection: React.FC<MoodSectionProps> = ({
  mood,
  moodDescription,
  onMoodChange,
  onMoodDescriptionChange
}) => {
  return (
    <DiarySection title="🌟 Ruh Hâlim Nasıldı?" icon={Heart}>
      <div className="space-y-4">
        <div>
          <label className="block text-pink-700 font-medium mb-3">
            Bugünkü ruh hâlim:
          </label>
          <div className="grid grid-cols-4 gap-3">
            {moodOptions.map((option) => (
              <button
                key={option.emoji}
                onClick={() => onMoodChange(option.emoji)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                  mood === option.emoji
                    ? 'border-pink-400 bg-pink-100 scale-105'
                    : 'border-pink-200 bg-pink-50 hover:border-pink-300 hover:bg-pink-100'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs text-pink-700 font-medium">
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-pink-700 font-medium mb-2">
            Kısa açıklama:
          </label>
          <textarea
            value={moodDescription}
            onChange={(e) => onMoodDescriptionChange(e.target.value)}
            placeholder="Bugün kendimi nasıl hissettim, neler yaşadım..."
            className="w-full bg-pink-50 border-2 border-pink-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 transition-all duration-300 resize-none"
            rows={4}
          />
        </div>
      </div>
    </DiarySection>
  );
};