import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';

interface DiaryHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DiaryHeader: React.FC<DiaryHeaderProps> = ({ selectedDate, onDateChange }) => {
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="text-center mb-8 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Sparkles className="text-blue-400 w-8 h-8" />
        <h1 className="text-4xl font-bold text-blue-800 font-poppins">
          Yaren'in Günlük Programı
        </h1>
        <Sparkles className="text-blue-400 w-8 h-8" />
      </div>
      
      <div className="flex items-center justify-center gap-3 mb-6">
        <Calendar className="text-blue-500 w-5 h-5" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2 text-blue-800 font-medium focus:outline-none focus:border-blue-400 transition-all duration-300"
        />
      </div>
      
      <p className="text-xl text-blue-700 font-medium">
        {formatDisplayDate(selectedDate)}
      </p>
    </div>
  );
};