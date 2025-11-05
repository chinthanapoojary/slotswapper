import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'slotswapper.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Events table
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        startTime DATETIME NOT NULL,
        endTime DATETIME NOT NULL,
        status TEXT DEFAULT 'BUSY',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Swap requests table
    db.run(`
      CREATE TABLE IF NOT EXISTS swapRequests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requesterUserId INTEGER NOT NULL,
        requesterSlotId INTEGER NOT NULL,
        targetUserId INTEGER NOT NULL,
        targetSlotId INTEGER NOT NULL,
        status TEXT DEFAULT 'PENDING',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requesterUserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (targetUserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (requesterSlotId) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (targetSlotId) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
  });
}

export default db;