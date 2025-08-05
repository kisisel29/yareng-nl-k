import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface DiarySectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const DiarySection: React.FC<DiarySectionProps> = ({ 
  title, 
  icon: Icon, 
  children,
  className = ""
}) => {
  return (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl p-4 mb-6 border-l-4 border-blue-400">
        <div className="flex items-center gap-3">
          <Icon className="text-blue-700 w-6 h-6" />
          <h2 className="text-xl font-semibold text-blue-800 font-poppins">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
};