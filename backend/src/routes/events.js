import express from 'express';
import verifyToken from '../middleware/auth.js';
import db from '../database.js';

const router = express.Router();

// Get all events for the user
router.get('/', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM events WHERE userId = ? ORDER BY startTime DESC',
    [req.userId],
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(events);
    }
  );
});

// Get specific event
router.get('/:id', verifyToken, (req, res) => {
  db.get(
    'SELECT * FROM events WHERE id = ? AND userId = ?',
    [req.params.id, req.userId],
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    }
  );
});

// Create event
router.post('/', verifyToken, (req, res) => {
  const { title, startTime, endTime } = req.body;

  if (!title || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO events (userId, title, startTime, endTime) VALUES (?, ?, ?, ?)',
    [req.userId, title, startTime, endTime],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        id: this.lastID,
        userId: req.userId,
        title,
        startTime,
        endTime,
        status: 'BUSY',
        createdAt: new Date().toISOString()
      });
    }
  );
});

// Update event
router.put('/:id', verifyToken, (req, res) => {
  const { title, startTime, endTime, status } = req.body;

  db.get(
    'SELECT * FROM events WHERE id = ? AND userId = ?',
    [req.params.id, req.userId],
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const newTitle = title || event.title;
      const newStartTime = startTime || event.startTime;
      const newEndTime = endTime || event.endTime;
      const newStatus = status || event.status;

      db.run(
        'UPDATE events SET title = ?, startTime = ?, endTime = ?, status = ? WHERE id = ?',
        [newTitle, newStartTime, newEndTime, newStatus, req.params.id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({
            id: parseInt(req.params.id),
            userId: req.userId,
            title: newTitle,
            startTime: newStartTime,
            endTime: newEndTime,
            status: newStatus
          });
        }
      );
    }
  );
});

// Delete event
router.delete('/:id', verifyToken, (req, res) => {
  db.get(
    'SELECT * FROM events WHERE id = ? AND userId = ?',
    [req.params.id, req.userId],
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      db.run('DELETE FROM events WHERE id = ?', [req.params.id], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Event deleted successfully' });
      });
    }
  );
});

export default router;