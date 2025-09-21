const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./data.db");


// Registrierung: currently unused
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, hashed],
    function (err) {
      if (err) return res.status(400).send("User existiert schon");
      res.send("Erfolgreich registriert");
    }
  );
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login Body:", req.body);

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) return res.status(500).send("DB Fehler");
    if (!user) {
      console.log("User nicht gefunden");
      return res.status(400).send("User nicht gefunden");
    }

    console.log("Passwort aus Frontend:", password);
    console.log("Hash aus DB:", user.password);

    const match = await bcrypt.compare(password, user.password);
    console.log("bcrypt.compare Ergebnis:", match);

    if (!match) return res.status(400).send("Falsches Passwort");

    const token = jwt.sign({ id: user.id }, "geheimeskey"); // für Schulprojekt ok
    res.json({ token });
  });
});


// ====================
// Dashboard Endpoints
// ====================

// Pie Chart: daily totals
app.get("/api/pie", (req, res) => {
  db.all(
    `SELECT room as name, value FROM pie_data WHERE user_id = 1`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Hourly totals
app.get("/api/hourlyTotals", (req, res) => {
  db.all(
    `SELECT time, value FROM hourly_totals WHERE user_id = 1 ORDER BY time ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Kitchen hourly
app.get("/api/kitchen", (req, res) => {
  db.all(
    `SELECT time, value as kitchen FROM kitchen_hourly WHERE user_id = 1 ORDER BY time ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Livingroom hourly
app.get("/api/living", (req, res) => {
  db.all(
    `SELECT time, value as living FROM livingroom_hourly WHERE user_id = 1 ORDER BY time ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Bedroom hourly
app.get("/api/bedroom", (req, res) => {
  db.all(
    `SELECT time, value as bedroom FROM bedroom_hourly WHERE user_id = 1 ORDER BY time ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.listen(3001, () => console.log("Server läuft auf 3001"));

module.exports = app;
