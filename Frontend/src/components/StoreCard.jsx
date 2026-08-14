import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

function StoreCard({ store, onRate }) {
  const [rating, setRating] = useState(0);
  const { user } = useAuth();

  const handleSubmitRating = async () => {
    if (rating > 0) {
      await onRate(store.id, rating);
      setRating(0);
    }
  };

  const avgRating = Number(store.avg_rating ?? store.average_rating ?? store.overall_rating ?? 0);

  return (
    <article className="store-card">
      <div className="store-card__image" />
      <div className="store-card__body">
        <div className="store-card__top">
          <h3 className="store-card__name">{store.name}</h3>
          <span className="star-row">★ {avgRating > 0 ? avgRating.toFixed(1) : 'New'}</span>
        </div>

        <div className="store-card__meta">
          <div>{store.email}</div>
          <div>{store.address}</div>
        </div>

        <div className="store-card__footer">
          <span className="store-card__rating">{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}</span>
          <span className="variant-label owner">Popular</span>
        </div>

        {user && user.role === 'user' && (
          <div className="rating-form">
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value={0}>Rate</option>
              <option value={1}>1 ★</option>
              <option value={2}>2 ★</option>
              <option value={3}>3 ★</option>
              <option value={4}>4 ★</option>
              <option value={5}>5 ★</option>
            </select>
            <button className="btn-primary" onClick={handleSubmitRating} disabled={rating === 0}>Submit</button>
          </div>
        )}
      </div>
    </article>
  );
}

export default StoreCard;