'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabels?: boolean;
}

const RATING_LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Very Poor', emoji: '😡', color: 'text-red-600' },
  2: { text: 'Poor', emoji: '🙁', color: 'text-amber-600' },
  3: { text: 'Average', emoji: '😐', color: 'text-yellow-600' },
  4: { text: 'Good', emoji: '🙂', color: 'text-emerald-600' },
  5: { text: 'Excellent', emoji: '🤩', color: 'text-[#00a699]' },
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showLabels = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const currentDisplay = hoverRating !== null ? hoverRating : value;

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentDisplay;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(null)}
              className={`transition-all duration-150 transform ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-125 focus:outline-none'
              }`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'fill-gray-100 text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabels && currentDisplay > 0 && RATING_LABELS[currentDisplay] && (
        <div className={`text-xs font-bold ${RATING_LABELS[currentDisplay].color} flex items-center gap-1 animate-fadeIn`}>
          <span>{RATING_LABELS[currentDisplay].emoji}</span>
          <span>{RATING_LABELS[currentDisplay].text}</span>
          <span className="text-gray-400 font-normal">({currentDisplay}/5 Stars)</span>
        </div>
      )}
    </div>
  );
};
