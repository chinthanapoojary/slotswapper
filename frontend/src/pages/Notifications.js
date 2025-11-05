import React, { useState, useEffect } from 'react';
import client from '../api/client';

const Notifications = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [incomingRes, outgoingRes] = await Promise.all([
        client.get('/swaps/requests/incoming'),
        client.get('/swaps/requests/outgoing'),
      ]);
      setIncomingRequests(incomingRes.data);
      setOutgoingRequests(outgoingRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, accept) => {
    try {
      await client.post(`/swaps/response/${requestId}`, { accept });
      setSuccess(
        accept
          ? '✅ Swap accepted successfully!'
          : '❌ Swap rejected'
      );
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to respond to swap request');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>📬 Swap Requests</h1>
        <p>View and manage your swap requests</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="notifications-container">
        {/* Incoming Requests */}
        <div className="notifications-section">
          <h3>📨 Incoming Requests</h3>
          {incomingRequests.length === 0 ? (
            <div className="empty-state">
              <p>No incoming requests</p>
            </div>
          ) : (
            <div className="notification-grid">
              {incomingRequests.map((request) => (
                <div key={request.id} className="card">
                  <div className="card-title">
                    Swap Request from {request.fromUserName}
                  </div>

                  <div className="slot-info">
                    <div className="card-subtitle">They want your slot:</div>
                    <div className="card-title">{request.mySlotTitle}</div>
                    <div className="event-time">
                      🕐 {formatDateTime(request.mySlotStartTime || request.mySlotStart)}
                    </div>
                  </div>

                  <div className="slot-info">
                    <div className="card-subtitle">In exchange for:</div>
                    <div className="card-title">{request.theirSlotTitle}</div>
                    <div className="event-time">
                      🕐 {formatDateTime(request.theirSlotStartTime || request.theirSlotStart)}
                    </div>
                  </div>

                  <div className="status">
                    {request.status === 'PENDING' && (
                      <span className="badge badge-pending">⏳ PENDING</span>
                    )}
                    {request.status === 'ACCEPTED' && (
                      <span className="badge badge-accepted">✅ ACCEPTED</span>
                    )}
                    {request.status === 'REJECTED' && (
                      <span className="badge badge-busy">❌ REJECTED</span>
                    )}
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="action-group">
                      <button
                        className="btn btn-success"
                        onClick={() => handleResponse(request.id, true)}
                      >
                        ✅ Accept
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleResponse(request.id, false)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Requests */}
        <div className="notifications-section">
          <h3>📤 Outgoing Requests</h3>
          {outgoingRequests.length === 0 ? (
            <div className="empty-state">
              <p>No outgoing requests</p>
            </div>
          ) : (
            <div className="notification-grid">
              {outgoingRequests.map((request) => (
                <div key={request.id} className="card">
                  <div className="card-title">
                    Pending with {request.toUserName}
                  </div>

                  <div className="slot-info">
                    <div className="card-subtitle">Your slot:</div>
                    <div className="card-title">{request.mySlotTitle}</div>
                    <div className="event-time">
                      🕐 {formatDateTime(request.mySlotStartTime || request.mySlotStart)}
                    </div>
                  </div>

                  <div className="slot-info">
                    <div className="card-subtitle">Their slot:</div>
                    <div className="card-title">{request.theirSlotTitle}</div>
                    <div className="event-time">
                      🕐 {formatDateTime(request.theirSlotStartTime || request.theirSlotStart)}
                    </div>
                  </div>

                  <div className="status">
                    {request.status === 'PENDING' && (
                      <span className="badge badge-pending">⏳ PENDING</span>
                    )}
                    {request.status === 'ACCEPTED' && (
                      <span className="badge badge-accepted">✅ ACCEPTED</span>
                    )}
                    {request.status === 'REJECTED' && (
                      <span className="badge badge-busy">❌ REJECTED</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;