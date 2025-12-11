const express = require('express'); 
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppass',
  database: process.env.DB_NAME || 'energy',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function waitForDb() {
  let tries = 0;
  while (tries < 30) {
    try {
      await pool.query('SELECT 1');
      console.log('DB is ready');
      return;
    } catch (err) {
      tries++;
      console.log('Waiting for DB... attempt', tries);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('Unable to connect to DB after multiple attempts');
}

// --- HEALTHCHECK ---
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'db error' });
  }
});

// --- PIE DATA ---
app.get('/api/pieData', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT name, value FROM pie_data ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('db error');
  }
});

// --- HOURLY TOTALS ---
app.get('/api/hourlyTotals', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT time, value FROM hourly_totals ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('db error');
  }
});

// --- ROOM HOURLY DATA ---
app.get('/api/rooms/:room', async (req, res) => {
  const room = req.params.room;
  try {
    const [rows] = await pool.query(
      'SELECT time, value FROM room_hourly WHERE room = ? ORDER BY id',
      [room]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('db error');
  }
});

// --- MERGED HOURLY DATA ---
app.get('/api/mergedHourly', async (req, res) => {
  try {
    const [totals] = await pool.query('SELECT time, value FROM hourly_totals ORDER BY id');
    const [roomRows] = await pool.query(
      "SELECT time, room, value FROM room_hourly WHERE room IN ('kitchen','living','bedroom') ORDER BY id"
    );

    const map = {};
    totals.forEach(t => { map[t.time] = { time: t.time, value: Number(t.value) }; });
    roomRows.forEach(r => {
      if (!map[r.time]) map[r.time] = { time: r.time, value: 0 };
      map[r.time][r.room] = Number(r.value);
    });

    const merged = Object.values(map).sort((a, b) => a.time.localeCompare(b.time));
    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).send('db error');
  }
});

// --- START SERVER ---
(async () => {
  try {
    await waitForDb();
    const port = 5000;
    app.listen(port, () => console.log(`Backend listening on ${port}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
