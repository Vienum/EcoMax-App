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
// REGISTRATION ENDPOINT
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
    peopleInHousehold
  } = req.body;

  if (
    !userName || !email || !password || !fullName || !birthday ||
    !country || !city || !street || !houseNumber || !zipCode || !peopleInHousehold
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (
        username, email, password, full_name, birthday,
        country, city, street, house_number, zip_code, people_in_household
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        peopleInHousehold
      ],
      function (err) {
        if (err) {
          if (err.message.includes("username")) {
            return res.status(400).json({ error: "Username already exists" });
          }
          if (err.message.includes("email")) {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res.status(500).json({ error: "Registration failed" });
        }

        const user_id = this.lastID;
        const token = jwt.sign({ id: user_id, username: userName }, "geheimeskey");

        res.status(201).json({
          message: "Successfully registered",
          user_id,
          token
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// AUTH
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, "geheimeskey", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user_id = user.id;
    next();
  });
};

// ==========================================
// CREATE ROOM (Frontend Form Will Call This)
// ==========================================
app.post("/api/rooms", authenticateToken, (req, res) => {
  console.log(req.body)
  const roomName = req.body.room_name;

  if (!roomName) {
    return res.status(400).json({ error: "roomName is required" });
  }

  db.run(
    `INSERT INTO rooms (user_id, room_name) VALUES (?, ?)`,
    [req.user_id, roomName],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Room created",
        room_id: this.lastID,
        roomName
      });
    }
  );
});

// Get device readings for the last 24 hours
app.get("/api/device/:device_id/readings", authenticateToken, (req, res) => {
  const { device_id } = req.params;
  const userId = req.user_id;

  // Verify the device belongs to the user
  db.get(
    `SELECT * FROM devices WHERE device_id = ? AND user_id = ?`,
    [device_id, userId],
    (err, device) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!device) return res.status(404).json({ error: "Device not found" });

      // Fetch last 24 hours of readings
      db.all(
        `SELECT timestamp, kwh FROM device_readings
         WHERE device_id = ?
         AND timestamp >= datetime('now', '-24 hours')
         ORDER BY timestamp ASC`,
        [device_id],
        (err, readings) => {
          if (err) return res.status(500).json({ error: err.message });

          // Optional: fill missing hours with 0 if needed
          res.json(readings);
        }
      );
    }
  );
});



// get room
app.get("/api/rooms", authenticateToken, (req, res) => {
  const userId = req.user_id;

  db.all(`SELECT * FROM rooms WHERE user_id = ?`, [userId], (err, rooms) => {
    if (err) return res.status(500).json({ error: err.message });

    // Get devices for each room
    const roomPromises = rooms.map(room => new Promise((resolve, reject) => {
      db.all(`SELECT * FROM devices WHERE room_id = ?`, [room.room_id], (err, devices) => {
        if (err) reject(err);
        else resolve({ ...room, devices });
      });
    }));

    Promise.all(roomPromises)
      .then(results => res.json(results))
      .catch(error => res.status(500).json({ error: error.message }));
  });
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
        return res.status(400).json({ error: "User or Password incorrect" });
      }

      console.log("Password from frontend:", password);
      console.log("Hash from DB:", user.password);

      const match = await bcrypt.compare(password, user.password);
      console.log("bcrypt.compare result:", match);

      if (!match) {
        return res.status(400).json({ error: "User or Password incorrect" });
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
// GET ROOMS
// ==========================================
app.get("/api/rooms", authenticateToken, (req, res) => {
  db.all(
    `SELECT room_id, room_name, created_at FROM rooms WHERE user_id = ?`,
    [req.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ==========================================
// START SERVER
// ==========================================
app.listen(3001, () => console.log("Server running on port 3001"));

module.exports = app;
