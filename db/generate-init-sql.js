// generate-init-sql.js
const fs = require("fs");

// Output file
const file = "init.sql";

// Base patterns for devices (24 hours)
const devicePatterns = {
  // Lukas devices
  1: [0.09,0.06,0.05,0.04,0.03,0.10,0.12,0.15,0.18,0.20,0.22,0.18,0.10,0.05,0.02,0.01,0.01,0.01,0.01,0.02,0.03,0.05,0.07,0.08], // TV
  2: [0.20,0.15,0.10,0.05,0.10,0.25,0.30,0.35,0.40,0.45,0.50,0.40,0.30,0.20,0.05,0.02,0.01,0.01,0.02,0.05,0.10,0.15,0.18,0.20], // PC
  3: new Array(24).fill(0.10), // Fridge
  // Sofia devices
  4: [0.08,0.05,0.04,0.04,0.05,0.08,0.10,0.12,0.15,0.20,0.18,0.15,0.08,0.04,0.02,0.01,0.01,0.01,0.01,0.02,0.03,0.05,0.06,0.07], // TV
  5: (() => { const arr=new Array(24).fill(0); arr[2]=0.20; arr[8]=0.25; arr[9]=0.20; return arr; })(), // Stove
  6: (() => { const arr=new Array(24).fill(0); arr[8]=0.50; arr[9]=0.40; return arr; })(), // Oven
  7: (() => { const arr=new Array(24).fill(0); for(let h=10;h<=13;h++) arr[h]=0.02; for(let h=14;h<=19;h++) arr[h]=0.03; return arr; })(), // Nightlight
  8: (() => { const arr=new Array(24).fill(0); arr[12]=0.20; arr[13]=0.20; for(let h=14;h<=19;h++) arr[h]=0.25; arr[20]=0.15; return arr; })(), // AC
  9: (() => { const arr=new Array(24).fill(0); arr[5]=0.50; arr[6]=0.30; return arr; })(), // Washer
};

// Helper: random variation ±20%
function vary(val) {
  const factor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  return +(val * factor).toFixed(2);
}

// Header + table creation + users/rooms/devices
let sql = `
CREATE DATABASE IF NOT EXISTS energy;
USE energy;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  birthday DATE NOT NULL,
  country VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,
  street VARCHAR(100) NOT NULL,
  house_number VARCHAR(20) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  people_in_household INT NOT NULL,
  premium TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username,email,password,full_name,birthday,country,city,street,house_number,zip_code,people_in_household,premium) VALUES
('lukas21','lukas@example.com','password123','Lukas Reinhardt','2002-07-12','Germany','Hamburg','Ahrenfelder Str.','54','20257',1,0),
('sofiaM2','sofia@example.com','mypassword456','Sofia Brandt','1985-03-18','Germany','Berlin','Prenzlauer Allee','212','10405',4,1);

DROP TABLE IF EXISTS rooms;
CREATE TABLE rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_name VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);

INSERT INTO rooms (user_id, room_name) VALUES
(1,'Living Room'),
(2,'Living Room'),
(2,'Kitchen'),
(2,'Sleeping Room'),
(2,'Washroom');

DROP TABLE IF EXISTS devices;
CREATE TABLE devices (
  device_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  device_name VARCHAR(50) NOT NULL,
  device_type VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(room_id) REFERENCES rooms(room_id)
);

INSERT INTO devices (user_id, room_id, device_name, device_type) VALUES
(1,1,'TV','Electronics'),
(1,1,'PC','Electronics'),
(1,1,'Fridge','Appliance'),
(2,2,'TV','Electronics'),
(2,3,'Stove','Appliance'),
(2,3,'Oven','Appliance'),
(2,4,'Nightlight','Light'),
(2,4,'AC','Air Conditioner'),
(2,5,'Washing Machine','Washer');

DROP TABLE IF EXISTS device_readings;
CREATE TABLE device_readings (
  reading_id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  kwh FLOAT NOT NULL,
  FOREIGN KEY(device_id) REFERENCES devices(device_id)
);
`;

// Generate 30-day hourly readings
const now = new Date();
for (let day = 29; day >= 0; day--) {
  for (let hour = 0; hour < 24; hour++) {
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - day);
    timestamp.setHours(hour,0,0,0);
    const tsStr = timestamp.toISOString().slice(0,19).replace("T"," ");
    for (const deviceId in devicePatterns) {
      const kwh = vary(devicePatterns[deviceId][hour]);
      sql += `INSERT INTO device_readings (device_id, timestamp, kwh) VALUES (${deviceId}, '${tsStr}', ${kwh});\n`;
    }
  }
}

// Write to file
fs.writeFileSync(file, sql);
console.log(`init.sql generated successfully with ${Object.keys(devicePatterns).length*24*30} readings!`);
