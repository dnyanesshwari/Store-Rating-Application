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
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>{store.name}</h3>
      <p><strong>Email:</strong> {store.email}</p>
      <p><strong>Address:</strong> {store.address}</p>
      <p><strong>Average Rating:</strong> {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'} ⭐</p>

      {user && user.role === 'user' && (
        <div style={{ marginTop: '1rem' }}>
          <label style={{ marginRight: '0.5rem' }}>Rate this store: </label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ marginRight: '0.5rem' }}>
            <option value={0}>Select rating</option>
            <option value={1}>1 ⭐</option>
            <option value={2}>2 ⭐</option>
            <option value={3}>3 ⭐</option>
            <option value={4}>4 ⭐</option>
            <option value={5}>5 ⭐</option>
          </select>
          <button onClick={handleSubmitRating} disabled={rating === 0} style={{
            padding: '0.5rem 1rem',
            cursor: rating === 0 ? 'not-allowed' : 'pointer',
            backgroundColor: rating === 0 ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}>Submit Rating</button>
        </div>
      )}
    </div>
  );
}

export default StoreCard;