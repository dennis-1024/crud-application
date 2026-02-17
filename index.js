import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import pool from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() AS now');
        res.json({ message: 'Server is running!', dbTime: rows[0].now });
    } catch (err) {
        res.status(500).json({ error: 'Database query failed', details: err.message });
    }
});

async function startServer() {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to the database:', err.message);
    process.exit(1);
  }
}

startServer();