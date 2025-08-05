import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import { DiarySection } from './DiarySection';

interface WhereSectionProps {
  places: string[];
  feelings: string;
  onPlacesChange: (places: string[]) => void;
  onFeelingsChange: (feelings: string) => void;
}

export const WhereSection: React.FC<WhereSectionProps> = ({
  places,
  feelings,
  onPlacesChange,
  onFeelingsChange
}) => {
  const addPlace = () => {
    onPlacesChange([...places, '']);
  };

  const updatePlace = (index: number, value: string) => {
    const newPlaces = [...places];
    newPlaces[index] = value;
    onPlacesChange(newPlaces);
  };

  const removePlace = (index: number) => {
    onPlacesChange(places.filter((_, i) => i !== index));
  };

  return (
    <DiarySection title="📍 Bugün Neredeydim?" icon={MapPin}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sol taraf - Resim */}
        <div className="lg:w-1/2">
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img
              src="/ghane.webp"
              alt="Güzel bir gün"
              className="w-full h-64 lg:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h4 className="text-lg font-semibold">Güzel Bir Gün</h4>
              <p className="text-sm opacity-90">Anılarınızı kaydedin</p>
            </div>
          </div>
        </div>

        {/* Sağ taraf - Form içeriği */}
        <div className="lg:w-1/2 space-y-4">
          <div>
            <h3 className="text-lg font-medium text-blue-700 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Gezdiğim yerler:
            </h3>
            <div className="space-y-2">
              {places.map((place, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => updatePlace(index, e.target.value)}
                    placeholder="Bir yer yazın..."
                    className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 transition-all duration-300"
                  />
                  <button
                    onClick={() => removePlace(index)}
                    className="text-red-500 hover:text-red-700 px-2 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={addPlace}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-all duration-300 border-2 border-dashed border-blue-300"
              >
                + Yer Ekle
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-blue-700 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Bu yerle ilgili hislerim:
            </h3>
            <textarea
              value={feelings}
              onChange={(e) => onFeelingsChange(e.target.value)}
              placeholder="Hislerimi burada paylaşabilirim..."
              className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>
    </DiarySection>
  );
};