// seed.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data.db");
const bcrypt = require("bcrypt");

async function seed() {
  try {
    // Hash passwords
    const hashedPassword1 = await bcrypt.hash("password123", 10);
    const hashedPassword2 = await bcrypt.hash("mypassword456", 10);

    db.serialize(() => {
      console.log("Seeding database...");

      // -----------------------------
      // DROP OLD TABLES
      // -----------------------------
      db.run(`DROP TABLE IF EXISTS device_readings`);
      db.run(`DROP TABLE IF EXISTS devices`);
      db.run(`DROP TABLE IF EXISTS rooms`);
      db.run(`DROP TABLE IF EXISTS users`);

      // -----------------------------
      // CREATE TABLES
      // -----------------------------
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
          people_in_household INTEGER NOT NULL,
          premium INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          room_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          room_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(user_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS devices (
          device_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          room_id INTEGER NOT NULL,
          device_name TEXT NOT NULL,
          device_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(user_id),
          FOREIGN KEY(room_id) REFERENCES rooms(room_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS device_readings (
          reading_id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id INTEGER NOT NULL,
          timestamp TEXT NOT NULL,
          kwh REAL NOT NULL,
          FOREIGN KEY(device_id) REFERENCES devices(device_id)
        )
      `);

      // -----------------------------
      // INSERT USERS
      // -----------------------------
      db.run(
        `INSERT INTO users 
          (username, email, password, full_name, birthday, country, city, street, house_number, zip_code, people_in_household, premium) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ["lukas21", "lukas@example.com", hashedPassword1, "Lukas Reinhardt", "2002-07-12", "Germany", "Hamburg", "Ahrenfelder Str.", "54", "20257", 1, 0]
      );

      db.run(
        `INSERT INTO users 
          (username, email, password, full_name, birthday, country, city, street, house_number, zip_code, people_in_household, premium) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ["sofiaM2", "sofia@example.com", hashedPassword2, "Sofia Brandt", "1985-03-18", "Germany", "Berlin", "Prenzlauer Allee", "212", "10405", 4, 1]
      );

      // -----------------------------
      // INSERT ROOMS
      // -----------------------------
      // Lukas rooms
      db.run(`INSERT INTO rooms (user_id, room_name) VALUES (?, ?)`, [1, "Living Room"]);

      // Sofia rooms
      db.run(`INSERT INTO rooms (user_id, room_name) VALUES (?, ?)`, [2, "Living Room"]);
      db.run(`INSERT INTO rooms (user_id, room_name) VALUES (?, ?)`, [2, "Kitchen"]);
      db.run(`INSERT INTO rooms (user_id, room_name) VALUES (?, ?)`, [2, "Sleeping Room"]);
      db.run(`INSERT INTO rooms (user_id, room_name) VALUES (?, ?)`, [2, "Washroom"]);

      // -----------------------------
      // INSERT DEVICES
      // -----------------------------
      // Lukas devices (room_id = 1)
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (1, 1, 'TV', 'Electronics')`);
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (1, 1, 'PC', 'Electronics')`);
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (1, 1, 'Fridge', 'Appliance')`);

      // Sofia devices (room_ids = 2..5)
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (2, 2, 'TV', 'Electronics')`);
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (2, 3, 'Stove', 'Appliance')`);
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (2, 3, 'Oven', 'Appliance')`);
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (2, 4, 'Nightlight', 'Light')`);
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (2, 4, 'AC', 'Air Conditioner')`);
      db.run(`INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES (2, 5, 'Washing Machine', 'Washer')`);

      // -----------------------------
      // INSERT DEVICE READINGS (30 DAYS)
      // -----------------------------
      
      // Helper function to generate hourly data patterns
      const generateHourlyPattern = (basePattern) => {
        // Add some daily variation (±20%)
        return basePattern.map(val => {
          const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
          return val * variation;
        });
      };

      // Base patterns for each device (24 hours)
      const lukasTV = [0.09,0.06,0.05,0.04,0.03,0.10,0.12,0.15,0.18,0.20,0.22,0.18,0.10,0.05,0.02,0.01,0.01,0.01,0.01,0.02,0.03,0.05,0.07,0.08];
      const lukasPC = [0.20,0.15,0.10,0.05,0.10,0.25,0.30,0.35,0.40,0.45,0.50,0.40,0.30,0.20,0.05,0.02,0.01,0.01,0.02,0.05,0.10,0.15,0.18,0.20];
      const lukasFridge = new Array(24).fill(0.10);

      const sofiaTV = [0.08,0.05,0.04,0.04,0.05,0.08,0.10,0.12,0.15,0.20,0.18,0.15,0.08,0.04,0.02,0.01,0.01,0.01,0.01,0.02,0.03,0.05,0.06,0.07];
      const sofiaStoveBase = new Array(24).fill(0); 
      sofiaStoveBase[2]=0.20; sofiaStoveBase[8]=0.25; sofiaStoveBase[9]=0.20;
      const sofiaOvenBase = new Array(24).fill(0); 
      sofiaOvenBase[8]=0.50; sofiaOvenBase[9]=0.40;
      const sofiaNightlightBase = new Array(24).fill(0); 
      for(let h=10;h<=13;h++){sofiaNightlightBase[h]=0.02;} 
      for(let h=14;h<=19;h++){sofiaNightlightBase[h]=0.03;}
      const sofiaACBase = new Array(24).fill(0); 
      sofiaACBase[12]=0.20; sofiaACBase[13]=0.20; 
      for(let h=14;h<=19;h++){sofiaACBase[h]=0.25;} 
      sofiaACBase[20]=0.15;
      const sofiaWasherBase = new Array(24).fill(0); 
      sofiaWasherBase[5]=0.50; sofiaWasherBase[6]=0.30;

      const insertReadingsFor30Days = (deviceId, basePattern) => {
        const stmt = db.prepare(`INSERT INTO device_readings (device_id, timestamp, kwh) VALUES (?, ?, ?)`);
        
        // Generate data for last 30 days
        for (let day = 29; day >= 0; day--) {
          const dailyPattern = generateHourlyPattern(basePattern);
          
          for (let hour = 0; hour < 24; hour++) {
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - day);
            timestamp.setHours(hour, 0, 0, 0);
            
            stmt.run(deviceId, timestamp.toISOString(), dailyPattern[hour]);
          }
        }
        
        stmt.finalize();
      };

      // Insert readings for all devices
      console.log("Generating 30 days of device readings...");
      
      // Lukas devices
      insertReadingsFor30Days(1, lukasTV);
      insertReadingsFor30Days(2, lukasPC);
      insertReadingsFor30Days(3, lukasFridge);

      // Sofia devices
      insertReadingsFor30Days(4, sofiaTV);
      insertReadingsFor30Days(5, sofiaStoveBase);
      insertReadingsFor30Days(6, sofiaOvenBase);
      insertReadingsFor30Days(7, sofiaNightlightBase);
      insertReadingsFor30Days(8, sofiaACBase);
      insertReadingsFor30Days(9, sofiaWasherBase);

      console.log("Database seeded successfully with 30 days of data!");
    });

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    setTimeout(() => {
      db.close();
    }, 2000); // Give time for all inserts to complete
  }
}

seed();