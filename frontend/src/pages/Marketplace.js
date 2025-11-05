import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const Marketplace = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [selectedMySlot, setSelectedMySlot] = useState(null);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myEventsRes, swappableSlotsRes] = await Promise.all([
        client.get('/events'),
        client.get('/swaps/swappable-slots'),
      ]);
      setMyEvents(myEventsRes.data);
      setSwappableSlots(swappableSlotsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = async () => {
    if (!selectedMySlot || !selectedTheirSlot) {
      setError('⚠️ Select both slots');
      return;
    }

    try {
      await client.post('/swaps/request', {
        mySlotId: selectedMySlot.id,
        theirSlotId: selectedTheirSlot.id,
      });
      setSuccess('🔄 Swap request sent successfully!');
      setSelectedMySlot(null);
      setSelectedTheirSlot(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request swap');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  const mySwappableEvents = myEvents.filter((e) => e.status === 'SWAPPABLE');

  return (
    <div className="container">
      <div className="page-header">
        <h1>🛍️ Marketplace</h1>
        <p>Find and swap time slots with other users</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="marketplace-container">
        {/* My Slots */}
        <div>
          <div className="marketplace-section">
            <h3>✨ Your Swappable Slots</h3>
            {mySwappableEvents.length === 0 ? (
              <div className="empty-state">
                <p>No swappable slots. Go to Dashboard and mark events as swappable.</p>
              </div>
            ) : (
              <div className="marketplace-grid">
                {mySwappableEvents.map((slot) => (
                  <div
                    key={slot.id}
                    className={`card ${selectedMySlot?.id === slot.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMySlot(slot)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-title">{slot.title}</div>
                    <div className="event-time">
                      🕐 {new Date(slot.startTime).toLocaleString()}
                    </div>
                    <div className="event-time">
                      🕑 {new Date(slot.endTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Their Slots */}
        <div>
          <div className="marketplace-section">
            <h3>🔄 Available Slots</h3>
            {swappableSlots.length === 0 ? (
              <div className="empty-state">
                <p>No available slots to swap</p>
              </div>
            ) : (
              <div className="marketplace-grid">
                {swappableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`card ${
                      selectedTheirSlot?.id === slot.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedTheirSlot(slot)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-title">{slot.title}</div>
                    <div className="owner-info">
                      <div className="owner-name">👤 {slot.ownerName}</div>
                    </div>
                    <div className="event-time">
                      🕐 {new Date(slot.startTime).toLocaleString()}
                    </div>
                    <div className="event-time">
                      🕑 {new Date(slot.endTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={handleRequestSwap}
          disabled={!selectedMySlot || !selectedTheirSlot}
        >
          {!selectedMySlot || !selectedTheirSlot
            ? '⚠️ Select both slots'
            : '🔄 Request Swap'}
        </button>
      </div>
    </div>
  );
};

export default Marketplace;