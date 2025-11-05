import express from 'express';
import verifyToken from '../middleware/auth.js';
import db from '../database.js';

const router = express.Router();

// Get all swappable slots from other users
router.get('/swappable-slots', verifyToken, (req, res) => {
  db.all(
    `SELECT e.id, e.title, e.startTime, e.endTime, e.status, u.id as userId, u.name, u.email
     FROM events e
     JOIN users u ON e.userId = u.id
     WHERE e.userId != ? AND e.status = 'SWAPPABLE'
     ORDER BY e.startTime DESC`,
    [req.userId],
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(events);
    }
  );
});

// Get incoming swap requests
router.get('/requests/incoming', verifyToken, (req, res) => {
  db.all(
    `SELECT sr.id, sr.requesterUserId, sr.requesterSlotId, sr.targetUserId, sr.targetSlotId, sr.status,
            u.name as requesterName, u.email as requesterEmail,
            e1.title as mySlotTitle, e1.startTime as mySlotStart, e1.endTime as mySlotEnd,
            e2.title as theirSlotTitle, e2.startTime as theirSlotStart, e2.endTime as theirSlotEnd
     FROM swapRequests sr
     JOIN users u ON sr.requesterUserId = u.id
     JOIN events e1 ON sr.targetSlotId = e1.id
     JOIN events e2 ON sr.requesterSlotId = e2.id
     WHERE sr.targetUserId = ?
     ORDER BY sr.createdAt DESC`,
    [req.userId],
    (err, requests) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(requests);
    }
  );
});

// Get outgoing swap requests
router.get('/requests/outgoing', verifyToken, (req, res) => {
  db.all(
    `SELECT sr.id, sr.requesterUserId, sr.requesterSlotId, sr.targetUserId, sr.targetSlotId, sr.status,
            u.name as targetUserName, u.email as targetUserEmail,
            e1.title as mySlotTitle, e1.startTime as mySlotStart, e1.endTime as mySlotEnd,
            e2.title as theirSlotTitle, e2.startTime as theirSlotStart, e2.endTime as theirSlotEnd
     FROM swapRequests sr
     JOIN users u ON sr.targetUserId = u.id
     JOIN events e1 ON sr.requesterSlotId = e1.id
     JOIN events e2 ON sr.targetSlotId = e2.id
     WHERE sr.requesterUserId = ?
     ORDER BY sr.createdAt DESC`,
    [req.userId],
    (err, requests) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(requests);
    }
  );
});

// Create swap request
router.post('/request', verifyToken, (req, res) => {
  const { mySlotId, theirSlotId } = req.body;

  if (!mySlotId || !theirSlotId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get my slot and their slot info
  db.get('SELECT * FROM events WHERE id = ? AND userId = ?', [mySlotId, req.userId], (err, mySlot) => {
    if (err || !mySlot) {
      return res.status(404).json({ error: 'Your slot not found' });
    }

    db.get('SELECT * FROM events WHERE id = ?', [theirSlotId], (err, theirSlot) => {
      if (err || !theirSlot) {
        return res.status(404).json({ error: 'Their slot not found' });
      }

      if (theirSlot.status !== 'SWAPPABLE') {
        return res.status(400).json({ error: 'Slot is not available for swapping' });
      }

      db.run(
        `INSERT INTO swapRequests (requesterUserId, requesterSlotId, targetUserId, targetSlotId)
         VALUES (?, ?, ?, ?)`,
        [req.userId, mySlotId, theirSlot.userId, theirSlotId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.status(201).json({
            id: this.lastID,
            message: 'Swap request created successfully'
          });
        }
      );
    });
  });
});

// Accept or reject swap request
router.post('/response/:requestId', verifyToken, (req, res) => {
  const { accept } = req.body;
  const requestId = req.params.requestId;

  db.get('SELECT * FROM swapRequests WHERE id = ?', [requestId], (err, request) => {
    if (err || !request) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (request.targetUserId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!accept) {
      // Reject the request
      db.run('UPDATE swapRequests SET status = ? WHERE id = ?', ['REJECTED', requestId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Swap request rejected' });
      });
    } else {
      // Accept the request - swap the slots
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Get both slots
        db.get('SELECT * FROM events WHERE id = ?', [request.requesterSlotId], (err, slot1) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Database error' });
          }

          db.get('SELECT * FROM events WHERE id = ?', [request.targetSlotId], (err, slot2) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Database error' });
            }

            // Swap the owners
            db.run('UPDATE events SET userId = ? WHERE id = ?', [slot2.userId, slot1.id], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error' });
              }

              db.run('UPDATE events SET userId = ? WHERE id = ?', [slot1.userId, slot2.id], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Database error' });
                }

                // Update request status
                db.run('UPDATE swapRequests SET status = ? WHERE id = ?', ['ACCEPTED', requestId], (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Database error' });
                  }

                  // Reset slot statuses back to BUSY
                  db.run('UPDATE events SET status = ? WHERE id = ?', ['BUSY', slot1.id], (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ error: 'Database error' });
                    }

                    db.run('UPDATE events SET status = ? WHERE id = ?', ['BUSY', slot2.id], (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Database error' });
                      }

                      db.run('COMMIT', (err) => {
                        if (err) {
                          return res.status(500).json({ error: 'Database error' });
                        }
                        res.json({ message: 'Swap accepted successfully' });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    }
  });
});

export default router;