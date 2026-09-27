import { useState } from 'react';

export default function Stars({ initial = 5, onChange }) {
  const [rating, setRating] = useState(initial);
  const [hover,  setHover]  = useState(0);

  const pick = (n) => {
    setRating(n);
    onChange?.(n);
  };

  return (
    <div className="stars" role="group" aria-label="Rate your experience">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`material-symbols-outlined star-icon${(hover || rating) >= n ? ' on' : ''}`}
          style={{ fontVariationSettings: (hover || rating) >= n ? "'FILL' 1" : "'FILL' 0" }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => pick(n)}
          role="radio"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-checked={rating === n}
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && pick(n)}
        >
          star
        </span>
      ))}
    </div>
  );
}
