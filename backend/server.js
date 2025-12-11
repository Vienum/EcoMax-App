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
// LOGIN ENDPOINT
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
// AUTH MIDDLEWARE
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
// ROOM ENDPOINTS
// ==========================================

// Get all rooms for user
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

// Create room
app.post("/api/rooms", authenticateToken, (req, res) => {
  console.log(req.body);
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
        room_name: roomName
      });
    }
  );
});

// Delete a room and all associated devices & readings
app.delete("/api/room/:room_id", authenticateToken, (req, res) => {
  const { room_id } = req.params;
  const userId = req.user_id;

  db.get(
    `SELECT * FROM rooms WHERE room_id = ? AND user_id = ?`,
    [room_id, userId],
    (err, room) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!room) return res.status(404).json({ error: "Room not found" });

      // Get all devices in the room
      db.all(
        `SELECT device_id FROM devices WHERE room_id = ? AND user_id = ?`,
        [room_id, userId],
        (err, devices) => {
          if (err) return res.status(500).json({ error: err.message });

          const deviceIds = devices.map(d => d.device_id);

          // Delete readings for each device
          if (deviceIds.length > 0) {
            const placeholders = deviceIds.map(() => "?").join(",");
            db.run(
              `DELETE FROM device_readings WHERE device_id IN (${placeholders})`,
              deviceIds,
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
              }
            );
          }

          // Delete devices in the room
          db.run(
            `DELETE FROM devices WHERE room_id = ? AND user_id = ?`,
            [room_id, userId],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });

              // Finally, delete the room
              db.run(
                `DELETE FROM rooms WHERE room_id = ? AND user_id = ?`,
                [room_id, userId],
                (err) => {
                  if (err) return res.status(500).json({ error: err.message });

                  res.json({ message: "Room and all associated devices deleted successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
});

// ==========================================
// DEVICE ENDPOINTS
// ==========================================

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
          res.json(readings);
        }
      );
    }
  );
});

// ==========================================
// DASHBOARD / CONSUMPTION ENDPOINTS
// ==========================================

// Get user's total consumption and household data
app.get("/api/consumption/summary", authenticateToken, (req, res) => {
  const timeRange = req.query.range || '24h'; // Default to 24 hours

  db.get(
    `SELECT people_in_household, zip_code, premium FROM users WHERE user_id = ?`,
    [req.user_id],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: "User not found" });

      // Determine time condition and average divisor
      let timeCondition = '';
      let divisor = 365; // Default for 24h (daily average)
      
      switch(timeRange) {
        case '24h':
          timeCondition = "AND dr.timestamp >= datetime('now', '-1 day')";
          divisor = 365; // Daily average
          break;
        case '7d':
          timeCondition = "AND dr.timestamp >= datetime('now', '-7 days')";
          divisor = 52; // Weekly average
          break;
        case '30d':
          timeCondition = "AND dr.timestamp >= datetime('now', '-30 days')";
          divisor = 12; // Monthly average
          break;
        default:
          timeCondition = "AND dr.timestamp >= datetime('now', '-1 day')";
          divisor = 365;
      }

      // Calculate total consumption from device readings for the time range
      db.get(
        `SELECT SUM(dr.kwh) as total_consumption
         FROM device_readings dr
         JOIN devices d ON dr.device_id = d.device_id
         WHERE d.user_id = ? ${timeCondition}`,
        [req.user_id],
        (err, consumption) => {
          if (err) return res.status(500).json({ error: err.message });
          
          const totalConsumption = consumption?.total_consumption || 0;
          // Calculate average based on time range: (1500 kWh/year * people) / divisor
          const averageConsumption = (user.people_in_household * 1500) / divisor;
          const percentage = averageConsumption > 0 
            ? ((totalConsumption - averageConsumption) / averageConsumption * 100).toFixed(1)
            : 0;

          res.json({
            total_consumption: totalConsumption,
            average_consumption: averageConsumption,
            people_in_household: user.people_in_household,
            percentage_difference: parseFloat(percentage),
            zip_code: user.zip_code,
            premium: user.premium,
            time_range: timeRange
          });
        }
      );
    }
  );
});

// Get consumption by room for pie chart
app.get("/api/consumption/by-room", authenticateToken, (req, res) => {
  const timeRange = req.query.range || '24h'; // Default to 24 hours
  
  let timeCondition = '';
  switch(timeRange) {
    case '24h':
      timeCondition = "AND dr.timestamp >= datetime('now', '-1 day')";
      break;
    case '7d':
      timeCondition = "AND dr.timestamp >= datetime('now', '-7 days')";
      break;
    case '30d':
      timeCondition = "AND dr.timestamp >= datetime('now', '-30 days')";
      break;
    default:
      timeCondition = "AND dr.timestamp >= datetime('now', '-1 day')";
  }

  db.all(
    `SELECT 
       r.room_name as name,
       SUM(dr.kwh) as value
     FROM device_readings dr
     JOIN devices d ON dr.device_id = d.device_id
     JOIN rooms r ON d.room_id = r.room_id
     WHERE d.user_id = ? ${timeCondition}
     GROUP BY r.room_id, r.room_name`,
    [req.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Get hourly consumption for line chart
app.get("/api/consumption/hourly", authenticateToken, (req, res) => {
  const timeRange = req.query.range || '24h';
  
  let timeCondition = '';
  let groupBy = '';
  
  switch(timeRange) {
    case '24h':
      timeCondition = "AND dr.timestamp >= datetime('now', '-1 day')";
      groupBy = "strftime('%H:00', dr.timestamp)";
      break;
    case '7d':
      timeCondition = "AND dr.timestamp >= datetime('now', '-7 days')";
      groupBy = "strftime('%Y-%m-%d', dr.timestamp)";
      break;
    case '30d':
      timeCondition = "AND dr.timestamp >= datetime('now', '-30 days')";
      groupBy = "strftime('%Y-%m-%d', dr.timestamp)";
      break;
    default:
      timeCondition = "AND dr.timestamp >= datetime('now', '-1 day')";
      groupBy = "strftime('%H:00', dr.timestamp)";
  }

  db.all(
    `SELECT 
       ${groupBy} as time,
       SUM(dr.kwh) as value
     FROM device_readings dr
     JOIN devices d ON dr.device_id = d.device_id
     WHERE d.user_id = ? ${timeCondition}
     GROUP BY ${groupBy}
     ORDER BY time ASC`,
    [req.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// ==========================================
// USER PROFILE ENDPOINT
// ==========================================
app.get("/api/user/profile", authenticateToken, (req, res) => {
  db.get(
    `SELECT user_id, username, email, full_name, birthday, 
            country, city, street, house_number, zip_code, 
            people_in_household, premium, created_at
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
// GSI (GRÜNSTROMINDEX) ENDPOINT
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

// ==========================================
// START SERVER
// ==========================================
app.listen(3001, () => console.log("Server running on port 3001"));

module.exports = app;