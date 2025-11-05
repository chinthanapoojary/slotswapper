import React, { useState, useEffect } from 'react';
import client from '../api/client';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await client.get('/events');
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await client.post('/events', formData);
      setFormData({ title: '', startTime: '', endTime: '' });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError('Failed to create event');
    }
  };

  const toggleSwappable = async (eventId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
      await client.put(`/events/${eventId}`, { status: newStatus });
      fetchEvents();
    } catch (err) {
      setError('Failed to update event');
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await client.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>📌 Your Events</h1>
        <p>Manage your calendar and mark slots for swapping</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button
        className="btn btn-primary"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '❌ Cancel' : '➕ Create Event'}
      </button>

      {showForm && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <form onSubmit={handleCreateEvent}>
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="form-group">
              <label>🕐 Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>🕑 End Time</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>

            <button type="submit" className="btn btn-success">
              ✨ Create Event
            </button>
          </form>
        </div>
      )}

      <div className="grid">
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No events yet</div>
            <p>Create your first event to get started</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="card">
              <div className="card-title">{event.title}</div>
              <div className="card-subtitle">{event.status}</div>

              <div className="event-time">
                🕐 {new Date(event.startTime).toLocaleString()}
              </div>
              <div className="event-time">
                🕑 {new Date(event.endTime).toLocaleString()}
              </div>

              <div className="status">
                {event.status === 'BUSY' ? (
                  <>
                    <span className="badge badge-busy">🔒 BUSY</span>
                  </>
                ) : (
                  <>
                    <span className="badge badge-swappable">✨ SWAPPABLE</span>
                  </>
                )}
              </div>

              <div className="action-group">
                <button
                  className={`btn ${
                    event.status === 'BUSY' ? 'btn-success' : 'btn-secondary'
                  }`}
                  onClick={() => toggleSwappable(event.id, event.status)}
                >
                  {event.status === 'BUSY' ? '🔄 Make Swappable' : '🔒 Mark Busy'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteEvent(event.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;