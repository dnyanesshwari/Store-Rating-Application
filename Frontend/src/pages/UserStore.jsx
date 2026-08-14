import React, { useEffect, useState } from 'react';
import { getStores, submitRating } from '../api';
import StoreCard from '../components/StoreCard';

function UserStore() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ query: '' });

  const loadStores = async () => {
    const res = await getStores({ query: search.query });
    setStores(res.data);
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStores();
  };

  const handleRate = async (storeId, rating) => {
    try {
      await submitRating(storeId, rating);
      loadStores();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to submit rating');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2>Stores</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          placeholder="Search stores"
          value={search.query}
          onChange={(e) => setSearch({ query: e.target.value })}
        />
        <button type="submit">Search</button>
      </form>

      {stores.map((store) => (
        <StoreCard key={store.id} store={store} onRate={handleRate} />
      ))}
    </div>
  );
}

export default UserStore;