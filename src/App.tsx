import React, { useState } from 'react';
import { DiaryHeader } from './components/DiaryHeader';
import { WhereSection } from './components/WhereSection';
import { ReadingSection } from './components/ReadingSection';
import { LearningSection } from './components/LearningSection';
import { CreativeSection } from './components/CreativeSection';
import { MoodSection } from './components/MoodSection';
import { TomorrowSection } from './components/TomorrowSection';
import { StarMomentSection } from './components/StarMomentSection';
import { WeeklyLetterSection } from './components/WeeklyLetterSection';
import { useDiaryData } from './hooks/useDiaryData';
import { Router as Butterfly } from 'lucide-react';

function App() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { entry, updateEntry, isWeeklyLetterDay } = useDiaryData(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white font-poppins">
      {/* Decorative butterflies */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <Butterfly className="absolute top-20 left-10 text-blue-300 w-8 h-8 opacity-30 animate-bounce" />
        <Butterfly className="absolute top-40 right-20 text-blue-400 w-6 h-6 opacity-40 animate-pulse" />
        <Butterfly className="absolute bottom-32 left-1/4 text-blue-300 w-7 h-7 opacity-35 animate-bounce" />
        <Butterfly className="absolute bottom-20 right-10 text-blue-400 w-5 h-5 opacity-30 animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <DiaryHeader 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <div className="space-y-8 animate-fade-in-up">
          <WhereSection
            places={entry.places}
            feelings={entry.feelings}
            onPlacesChange={(places) => updateEntry('places', places)}
            onFeelingsChange={(feelings) => updateEntry('feelings', feelings)}
          />

          <ReadingSection
            bookName={entry.bookName}
            impactfulQuote={entry.impactfulQuote}
            whyInteresting={entry.whyInteresting}
            onBookNameChange={(bookName) => updateEntry('bookName', bookName)}
            onImpactfulQuoteChange={(impactfulQuote) => updateEntry('impactfulQuote', impactfulQuote)}
            onWhyInterestingChange={(whyInteresting) => updateEntry('whyInteresting', whyInteresting)}
          />

          <LearningSection
            whatLearned={entry.whatLearned}
            whereHowLearned={entry.whereHowLearned}
            importantNote={entry.importantNote}
            onWhatLearnedChange={(whatLearned) => updateEntry('whatLearned', whatLearned)}
            onWhereHowLearnedChange={(whereHowLearned) => updateEntry('whereHowLearned', whereHowLearned)}
            onImportantNoteChange={(importantNote) => updateEntry('importantNote', importantNote)}
          />

          <CreativeSection
            creativeWork={entry.creativeWork}
            onCreativeWorkChange={(creativeWork) => updateEntry('creativeWork', creativeWork)}
          />

          <MoodSection
            mood={entry.mood}
            moodDescription={entry.moodDescription}
            onMoodChange={(mood) => updateEntry('mood', mood)}
            onMoodDescriptionChange={(moodDescription) => updateEntry('moodDescription', moodDescription)}
          />

          <TomorrowSection
            goals={entry.goals}
            selfMessage={entry.selfMessage}
            onGoalsChange={(goals) => updateEntry('goals', goals)}
            onSelfMessageChange={(selfMessage) => updateEntry('selfMessage', selfMessage)}
          />

          <StarMomentSection
            starMoment={entry.starMoment}
            onStarMomentChange={(starMoment) => updateEntry('starMoment', starMoment)}
          />

          <WeeklyLetterSection
            letter={entry.weeklyLetter}
            onLetterChange={(weeklyLetter) => updateEntry('weeklyLetter', weeklyLetter)}
            isWeekly={isWeeklyLetterDay}
          />
        </div>

        <div className="text-center mt-12 p-6 bg-white/50 rounded-2xl backdrop-blur-sm">
          <p className="text-blue-600 font-medium">
            Günlüğün otomatik olarak kaydediliyor 💾 
          </p>
          <p className="text-blue-500 text-sm mt-1">
            Her gün yeni anılar biriktirmeye devam et! ✨
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;