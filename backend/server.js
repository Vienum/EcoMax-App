const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./data.db");

// ==========================================
// Database Initialization - Run this once!
// ==========================================
db.serialize(() => {
  // Drop old tables if starting fresh
  // db.run(`DROP TABLE IF EXISTS users`);
  
  // Create users table with all registration fields
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      birthday TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      street TEXT NOT NULL,
      house_number TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Update existing tables to use user_id instead of hardcoded values
  // You'll need to update these tables based on your actual schema
  db.run(`
    CREATE TABLE IF NOT EXISTS pie_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room TEXT NOT NULL,
      value REAL NOT NULL,
      date DATE DEFAULT (DATE('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS hourly_totals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      time TEXT NOT NULL,
      value REAL NOT NULL,
      date DATE DEFAULT (DATE('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS kitchen_hourly (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      time TEXT NOT NULL,
      value REAL NOT NULL,
      date DATE DEFAULT (DATE('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS livingroom_hourly (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      time TEXT NOT NULL,
      value REAL NOT NULL,
      date DATE DEFAULT (DATE('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bedroom_hourly (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      time TEXT NOT NULL,
      value REAL NOT NULL,
      date DATE DEFAULT (DATE('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `);

  // Optional: Table for IoT devices that users will register later
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      device_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      device_name TEXT NOT NULL,
      room TEXT NOT NULL,
      device_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `);
});

// ==========================================
// Registration Endpoint
// ==========================================
app.post("/register", async (req, res) => {
  const {
    userName,
    email,
    password,
    fullName,
    birthday,
    country,
    city,
    street,
    houseNumber,
    zipCode,
  } = req.body;

  // Validate required fields
  if (!userName || !email || !password || !fullName || !birthday || 
      !country || !city || !street || !houseNumber || !zipCode) {
    return res.status(400).json({ 
      error: "All fields are required" 
    });
  }

  try {
    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user into database
    db.run(
      `INSERT INTO users (
        username, email, password, full_name, birthday,
        country, city, street, house_number, zip_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userName,
        email,
        hashed,
        fullName,
        birthday,
        country,
        city,
        street,
        houseNumber,
        zipCode,
      ],
      function (err) {
        if (err) {
          // Check for unique constraint violations
          if (err.message.includes("UNIQUE constraint failed: users.username")) {
            return res.status(400).json({ error: "Username already exists" });
          }
          if (err.message.includes("UNIQUE constraint failed: users.email")) {
            return res.status(400).json({ error: "Email already exists" });
          }
          console.error("Registration error:", err);
          return res.status(500).json({ error: "Registration failed" });
        }

        // Successfully registered - return user_id and token
        const user_id = this.lastID;
        const token = jwt.sign({ id: user_id, username: userName }, "geheimeskey");
        
        res.status(201).json({
          message: "Successfully registered",
          user_id: user_id,
          token: token,
        });
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ==========================================
// Login Endpoint (Updated)
// ==========================================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login Body:", req.body);

  db.get(
    `SELECT user_id, username, password FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!user) {
        console.log("User not found");
        return res.status(400).json({ error: "User not found" });
      }

      console.log("Password from frontend:", password);
      console.log("Hash from DB:", user.password);

      const match = await bcrypt.compare(password, user.password);
      console.log("bcrypt.compare result:", match);

      if (!match) {
        return res.status(400).json({ error: "Wrong password" });
      }

      const token = jwt.sign(
        { id: user.user_id, username: user.username },
        "geheimeskey"
      );
      res.json({ 
        token,
        user_id: user.user_id,
        username: user.username 
      });
    }
  );
});

// ==========================================
// Middleware to verify JWT and extract user_id
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, "geheimeskey", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user_id = user.id;
    next();
  });
};

// ==========================================
// Dashboard Endpoints (Updated with auth)
// ==========================================

// Pie Chart: daily totals
app.get("/api/pie", authenticateToken, (req, res) => {
  db.all(
    `SELECT room as name, value FROM pie_data WHERE user_id = ?`,
    [req.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Hourly totals
app.get("/api/hourlyTotals", authenticateToken, (req, res) => {
  db.all(
    `SELECT time, value FROM hourly_totals WHERE user_id = ? ORDER BY time ASC`,
    [req.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Kitchen hourly
app.get("/api/kitchen", authenticateToken, (req, res) => {
  db.all(
    `SELECT time, value as kitchen FROM kitchen_hourly WHERE user_id = ? ORDER BY time ASC`,
    [req.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Livingroom hourly
app.get("/api/living", authenticateToken, (req, res) => {
  db.all(
    `SELECT time, value as living FROM livingroom_hourly WHERE user_id = ? ORDER BY time ASC`,
    [req.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Bedroom hourly
app.get("/api/bedroom", authenticateToken, (req, res) => {
  db.all(
    `SELECT time, value as bedroom FROM bedroom_hourly WHERE user_id = ? ORDER BY time ASC`,
    [req.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ==========================================
// Optional: Get user profile info
// ==========================================
app.get("/api/user/profile", authenticateToken, (req, res) => {
  db.get(
    `SELECT user_id, username, email, full_name, birthday, 
            country, city, street, house_number, zip_code, created_at
     FROM users WHERE user_id = ?`,
    [req.user_id],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    }
  );
});

// ==========================================
// Get Grünstromindex data for user's ZIP code
// ==========================================
app.get("/api/gsi", authenticateToken, async (req, res) => {
  try {
    // Get user's ZIP code from database
    db.get(
      `SELECT zip_code FROM users WHERE user_id = ?`,
      [req.user_id],
      async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user || !user.zip_code) {
          return res.status(404).json({ error: "User ZIP code not found" });
        }

        // Fetch GSI data from Corrently API
        const gsiUrl = `https://api.corrently.io/v2.0/gsi/prediction?zip=${user.zip_code}`;
        
        try {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(gsiUrl);
          const data = await response.json();
          
          res.json(data);
        } catch (fetchError) {
          console.error("Error fetching GSI data:", fetchError);
          res.status(500).json({ error: "Failed to fetch green energy data" });
        }
      }
    );
  } catch (error) {
    console.error("Error in GSI endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));

module.exports = app;