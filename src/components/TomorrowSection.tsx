import React from 'react';
import { Calendar, MessageCircle } from 'lucide-react';
import { DiarySection } from './DiarySection';

interface TomorrowSectionProps {
  goals: string[];
  selfMessage: string;
  onGoalsChange: (goals: string[]) => void;
  onSelfMessageChange: (message: string) => void;
}

export const TomorrowSection: React.FC<TomorrowSectionProps> = ({
  goals,
  selfMessage,
  onGoalsChange,
  onSelfMessageChange
}) => {
  const addGoal = () => {
    onGoalsChange([...goals, '']);
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    onGoalsChange(newGoals);
  };

  const removeGoal = (index: number) => {
    onGoalsChange(goals.filter((_, i) => i !== index));
  };

  return (
    <DiarySection title="📅 Yarın Ne Yapmak İstiyorum?" icon={Calendar}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-blue-700 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Hedeflerim:
          </h3>
          <div className="space-y-2">
            {goals.map((goal, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateGoal(index, e.target.value)}
                  placeholder="Yarın yapmak istediğim bir şey..."
                  className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 transition-all duration-300"
                />
                <button
                  onClick={() => removeGoal(index)}
                  className="text-red-500 hover:text-red-700 px-2 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addGoal}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-all duration-300 border-2 border-dashed border-blue-300"
            >
              + Hedef Ekle
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-blue-700 mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Kendime mesajım:
          </h3>
          <textarea
            value={selfMessage}
            onChange={(e) => onSelfMessageChange(e.target.value)}
            placeholder="Yarına umutla bak! Kendine güzel bir mesaj yaz..."
            className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
            rows={3}
          />
        </div>
      </div>
    </DiarySection>
  );
};