import React from 'react';
import { Palette } from 'lucide-react';
import { DiarySection } from './DiarySection';

interface CreativeSectionProps {
  creativeWork: string;
  onCreativeWorkChange: (value: string) => void;
}

export const CreativeSection: React.FC<CreativeSectionProps> = ({
  creativeWork,
  onCreativeWorkChange
}) => {
  return (
    <DiarySection title="🎨 Bir Şey Yarat!" icon={Palette}>
      <div>
        <label className="block text-blue-700 font-medium mb-2">
          Bugün çizdiğim, yazdığım, hayal ettiğim bir şey:
        </label>
        <textarea
          value={creativeWork}
          onChange={(e) => onCreativeWorkChange(e.target.value)}
          placeholder="Yaratıcı düşüncelerimi, çizimlerimi veya hayallerimi burada paylaşabilirim..."
          className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
          rows={6}
        />
        <p className="text-sm text-blue-600 mt-2">
          💡 İpucu: Buraya çizimlerinizi tarif edebilir, yazdığınız şiirleri paylaşabilir veya hayalinizdeki projeleri anlatabilirsiniz!
        </p>
      </div>
    </DiarySection>
  );
};