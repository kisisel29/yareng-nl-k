import { useState, useEffect } from 'react';

export interface DiaryEntry {
  date: string;
  places: string[];
  feelings: string;
  bookName: string;
  impactfulQuote: string;
  whyInteresting: string;
  whatLearned: string;
  whereHowLearned: string;
  importantNote: string;
  creativeWork: string;
  mood: string;
  moodDescription: string;
  goals: string[];
  selfMessage: string;
  starMoment: string;
  weeklyLetter: string;
}

const getDefaultEntry = (date: string): DiaryEntry => ({
  date,
  places: [''],
  feelings: '',
  bookName: '',
  impactfulQuote: '',
  whyInteresting: '',
  whatLearned: '',
  whereHowLearned: '',
  importantNote: '',
  creativeWork: '',
  mood: '',
  moodDescription: '',
  goals: [''],
  selfMessage: '',
  starMoment: '',
  weeklyLetter: ''
});

export const useDiaryData = (selectedDate: string) => {
  const [entry, setEntry] = useState<DiaryEntry>(() => {
    const saved = localStorage.getItem(`diary-${selectedDate}`);
    return saved ? JSON.parse(saved) : getDefaultEntry(selectedDate);
  });

  useEffect(() => {
    const saved = localStorage.getItem(`diary-${selectedDate}`);
    if (saved) {
      setEntry(JSON.parse(saved));
    } else {
      setEntry(getDefaultEntry(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`diary-${selectedDate}`, JSON.stringify(entry));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [entry, selectedDate]);

  const updateEntry = <K extends keyof DiaryEntry>(
    key: K,
    value: DiaryEntry[K]
  ) => {
    setEntry(prev => ({ ...prev, [key]: value }));
  };

  const isWeeklyLetterDay = () => {
    const date = new Date(selectedDate);
    return date.getDay() === 0; // Sunday
  };

  return {
    entry,
    updateEntry,
    isWeeklyLetterDay: isWeeklyLetterDay()
  };
};