
/**
 * Infinite TMS - Backend Implementation Reference
 * Requirements: express, pg, bcrypt, jsonwebtoken, multer, cors, dotenv
 */

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// DB Configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'infinite',
  password: 'amvion',
  port: 5432,
});

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- AUTH ROUTES ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- ADMIN ROUTES ---
app.post('/api/users', authenticate, isAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, role]
  );
  res.status(201).json(result.rows[0]);
});

app.post('/api/tickets', authenticate, isAdmin, async (req, res) => {
  const { title, description, month, year, userId } = req.body;
  const result = await pool.query(
    'INSERT INTO tickets (title, description, month, year, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, description, month, year, userId]
  );
  res.status(201).json(result.rows[0]);
});

app.get('/api/admin/tickets', authenticate, isAdmin, async (req, res) => {
  const result = await pool.query(`
    SELECT t.*, u.name as assignee_name 
    FROM tickets t 
    JOIN users u ON t.user_id = u.id 
    ORDER BY t.created_at DESC
  `);
  res.json(result.rows);
});

// --- USER ROUTES ---
app.get('/api/my-tickets', authenticate, async (req, res) => {
  const result = await pool.query('SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  res.json(result.rows);
});

app.post('/api/updates', authenticate, upload.single('screenshot'), async (req, res) => {
  const { ticketId, updateText } = req.body;
  const screenshotPath = req.file ? `/uploads/${req.file.filename}` : null;
  
  const result = await pool.query(
    'INSERT INTO ticket_updates (ticket_id, update_text, screenshot_path) VALUES ($1, $2, $3) RETURNING *',
    [ticketId, updateText, screenshotPath]
  );
  
  // Auto-update status to IN_PROGRESS if it's currently OPEN
  await pool.query("UPDATE tickets SET status = 'IN_PROGRESS' WHERE id = $1 AND status = 'OPEN'", [ticketId]);
  
  res.status(201).json(result.rows[0]);
});

app.listen(5000, () => console.log('Server running on port 5000'));
