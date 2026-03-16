import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'jobs.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }

  console.log('Connected to the SQLite database.');

  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT
      )`,
      (err) => { if (err) console.error('Error creating users table:', err.message); }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        userId TEXT,
        title TEXT,
        company TEXT,
        level TEXT,
        notes TEXT,
        url TEXT,
        interest TEXT,
        status TEXT,
        createdAt TEXT
      )`,
      (err) => { if (err) console.error('Error creating jobs table:', err.message); }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS interview_stages (
        id TEXT PRIMARY KEY,
        jobId TEXT,
        userId TEXT,
        stageNumber INTEGER,
        type TEXT,
        dateTime TEXT,
        notes TEXT,
        feedback TEXT,
        createdAt TEXT,
        FOREIGN KEY(jobId) REFERENCES jobs(id),
        FOREIGN KEY(userId) REFERENCES users(id)
      )`,
      (err) => { if (err) console.error('Error creating interview_stages table:', err.message); }
    );

    // Migration: add userId column if the table was created before auth was added.
    // Silently ignore the error if the column already exists.
    db.run('ALTER TABLE jobs ADD COLUMN userId TEXT', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Migration error:', err.message);
      }
    });
  });
});

export default db;
