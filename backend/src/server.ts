import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from './database';
import { authenticateToken, generateToken } from './auth';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// User Registration
app.post('/api/register', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }
  if (password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters' }); return; }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    db.run(
      'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
      [id, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            res.status(409).json({ error: 'Email already exists' }); return;
          }
          res.status(500).json({ error: err.message }); return;
        }
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// User Login
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: Record<string, string> | undefined) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!user) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    try {
      if (await bcrypt.compare(password, user.password)) {
        const token = generateToken({ id: user.id, email: user.email });
        res.json({ token, user: { id: user.id, email: user.email } });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch {
      res.status(500).json({ error: 'Error logging in' });
    }
  });
});

// Get all jobs for the authenticated user
app.get('/api/jobs', authenticateToken, (req: Request, res: Response) => {
  db.all('SELECT * FROM jobs WHERE userId = ?', [req.user!.id], (err, rows) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    res.json(rows);
  });
});

// Create a new job
app.post('/api/jobs', authenticateToken, (req: Request, res: Response) => {
  const { id, title, company, level, notes, url, interest, status, createdAt } = req.body as Record<string, string>;
  const userId = req.user!.id;
  const sql = `INSERT INTO jobs (id, userId, title, company, level, notes, url, interest, status, createdAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [id, userId, title, company, level, notes, url, interest, status, createdAt], function (err) {
    if (err) { res.status(400).json({ error: err.message }); return; }
    res.json({ id, userId, title, company, level, notes, url, interest, status, createdAt });
  });
});

// Update a job — returns the full updated job from DB
app.put('/api/jobs/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { title, company, level, notes, url, interest, status, createdAt } = req.body as Record<string, string | undefined>;

  const fieldsToUpdate: string[] = [];
  const params: unknown[] = [];

  if (title !== undefined)     { fieldsToUpdate.push('title = ?');     params.push(title); }
  if (company !== undefined)   { fieldsToUpdate.push('company = ?');   params.push(company); }
  if (level !== undefined)     { fieldsToUpdate.push('level = ?');     params.push(level); }
  if (notes !== undefined)     { fieldsToUpdate.push('notes = ?');     params.push(notes); }
  if (url !== undefined)       { fieldsToUpdate.push('url = ?');       params.push(url); }
  if (interest !== undefined)  { fieldsToUpdate.push('interest = ?');  params.push(interest); }
  if (status !== undefined)    { fieldsToUpdate.push('status = ?');    params.push(status); }
  if (createdAt !== undefined) { fieldsToUpdate.push('createdAt = ?'); params.push(createdAt); }

  if (fieldsToUpdate.length === 0) { res.status(400).json({ error: 'No fields to update provided' }); return; }

  params.push(id, userId);
  const sql = `UPDATE jobs SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND userId = ?`;

  db.run(sql, params, function (err) {
    if (err) { res.status(400).json({ error: err.message }); return; }
    if (this.changes === 0) { res.status(404).json({ error: 'Job not found or not authorized' }); return; }
    // Return the full updated job so frontend state stays in sync
    db.get('SELECT * FROM jobs WHERE id = ? AND userId = ?', [id, userId], (err2, row) => {
      if (err2) { res.status(500).json({ error: err2.message }); return; }
      res.json(row);
    });
  });
});

// Delete a job
app.delete('/api/jobs/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  db.run('DELETE FROM jobs WHERE id = ? AND userId = ?', [id, userId], function (err) {
    if (err) { res.status(400).json({ error: err.message }); return; }
    if (this.changes === 0) { res.status(404).json({ error: 'Job not found or not authorized' }); return; }
    res.json({ message: 'Job deleted successfully' });
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for undefined API routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

// Global error handler — always returns JSON, never HTML
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown — close DB connection cleanly on exit
function shutdown(signal: string): void {
  console.log(`\nReceived ${signal}. Closing server and database...`);
  server.close(() => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err.message);
      else console.log('Database connection closed.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
