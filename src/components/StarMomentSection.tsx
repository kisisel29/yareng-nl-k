import React from 'react';
import { Star } from 'lucide-react';
import { DiarySection } from './DiarySection';

interface StarMomentSectionProps {
  starMoment: string;
  onStarMomentChange: (moment: string) => void;
}

export const StarMomentSection: React.FC<StarMomentSectionProps> = ({
  starMoment,
  onStarMomentChange
}) => {
  return (
    <DiarySection title="✨ Günün Yıldız Anı" icon={Star} className="bg-gradient-to-br from-yellow-50 to-orange-50">
      <div>
        <label className="block text-blue-700 font-medium mb-2">
          Bugünün en mutlu anı:
        </label>
        <textarea
          value={starMoment}
          onChange={(e) => onStarMomentChange(e.target.value)}
          placeholder="Bugün yaşadığım en güzel, en mutlu an... ⭐"
          className="w-full bg-yellow-50 border-2 border-yellow-200 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-all duration-300 resize-none"
          rows={4}
        />
        <div className="flex justify-center mt-3">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
      </div>
    </DiarySection>
  );
};