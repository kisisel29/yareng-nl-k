import React from 'react';
import { Lightbulb } from 'lucide-react';
import { DiarySection } from './DiarySection';

interface LearningSectionProps {
  whatLearned: string;
  whereHowLearned: string;
  importantNote: string;
  onWhatLearnedChange: (value: string) => void;
  onWhereHowLearnedChange: (value: string) => void;
  onImportantNoteChange: (value: string) => void;
}

export const LearningSection: React.FC<LearningSectionProps> = ({
  whatLearned,
  whereHowLearned,
  importantNote,
  onWhatLearnedChange,
  onWhereHowLearnedChange,
  onImportantNoteChange
}) => {
  return (
    <DiarySection title="✍️ Bugün Ne Öğrendim?" icon={Lightbulb}>
      <div className="space-y-4">
        <div>
          <label className="block text-blue-700 font-medium mb-2">
            Öğrendiğim şey:
          </label>
          <input
            type="text"
            value={whatLearned}
            onChange={(e) => onWhatLearnedChange(e.target.value)}
            placeholder="Bugün öğrendiğim bir şey..."
            className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-blue-700 font-medium mb-2">
            Nerede/Nasıl öğrendim?
          </label>
          <textarea
            value={whereHowLearned}
            onChange={(e) => onWhereHowLearnedChange(e.target.value)}
            placeholder="Bu bilgiyi nerede veya nasıl öğrendim..."
            className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-blue-700 font-medium mb-2">
            Aklımda kalan önemli bir not:
          </label>
          <textarea
            value={importantNote}
            onChange={(e) => onImportantNoteChange(e.target.value)}
            placeholder="Bu konuda aklımda kalan önemli bir not..."
            className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
            rows={3}
          />
        </div>
      </div>
    </DiarySection>
  );
};