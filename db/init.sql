USE energy;

-- Pie chart (room totals)
DROP TABLE IF EXISTS pie_data;
CREATE TABLE pie_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  value FLOAT NOT NULL
);
INSERT INTO pie_data (name, value) VALUES
('Kitchen', 8.09),
('Living Room', 9.96),
('Bedroom', 5.06),
('Other', 1.79);

-- Hourly totals (00:00 ... 23:00)
DROP TABLE IF EXISTS hourly_totals;
CREATE TABLE hourly_totals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  time VARCHAR(5) NOT NULL,
  value FLOAT NOT NULL
);
INSERT INTO hourly_totals (time, value) VALUES
('00:00',0.4),('01:00',0.4),('02:00',0.4),('03:00',0.4),
('04:00',0.4),('05:00',0.4),('06:00',0.9),('07:00',1.2),
('08:00',0.9),('09:00',1.1),('10:00',1.1),('11:00',1.1),
('12:00',1.1),('13:00',1.1),('14:00',1.1),('15:00',1.1),
('16:00',1.1),('17:00',1.8),('18:00',2.0),('19:00',2.5),
('20:00',2.0),('21:00',1.6),('22:00',0.4),('23:00',0.4);

-- Room-by-room hourly (normalized)
DROP TABLE IF EXISTS room_hourly;
CREATE TABLE room_hourly (
  id INT AUTO_INCREMENT PRIMARY KEY,
  time VARCHAR(5) NOT NULL,
  room VARCHAR(50) NOT NULL,
  value FLOAT NOT NULL
);

-- Kitchen hourly (24 rows)
INSERT INTO room_hourly (time, room, value) VALUES
('00:00','kitchen',0.21),('01:00','kitchen',0.21),('02:00','kitchen',0.21),
('03:00','kitchen',0.21),('04:00','kitchen',0.21),('05:00','kitchen',0.21),
('06:00','kitchen',0.35),('07:00','kitchen',0.58),('08:00','kitchen',0.53),
('09:00','kitchen',0.41),('10:00','kitchen',0.41),('11:00','kitchen',0.41),
('12:00','kitchen',0.41),('13:00','kitchen',0.41),('14:00','kitchen',0.41),
('15:00','kitchen',0.41),('16:00','kitchen',0.44),('17:00','kitchen',0.72),
('18:00','kitchen',0.77),('19:00','kitchen',0.80),('20:00','kitchen',0.70),
('21:00','kitchen',0.58),('22:00','kitchen',0.21),('23:00','kitchen',0.21);

-- Living Room hourly
INSERT INTO room_hourly (time, room, value) VALUES
('00:00','living',0.11),('01:00','living',0.11),('02:00','living',0.11),
('03:00','living',0.11),('04:00','living',0.11),('05:00','living',0.11),
('06:00','living',0.16),('07:00','living',0.35),('08:00','living',0.60),
('09:00','living',0.80),('10:00','living',0.86),('11:00','living',0.86),
('12:00','living',0.86),('13:00','living',0.86),('14:00','living',0.86),
('15:00','living',0.86),('16:00','living',0.95),('17:00','living',1.20),
('18:00','living',1.40),('19:00','living',1.50),('20:00','living',1.30),
('21:00','living',1.10),('22:00','living',0.22),('23:00','living',0.22);

-- Bedroom hourly
INSERT INTO room_hourly (time, room, value) VALUES
('00:00','bedroom',0.21),('01:00','bedroom',0.21),('02:00','bedroom',0.21),
('03:00','bedroom',0.21),('04:00','bedroom',0.21),('05:00','bedroom',0.21),
('06:00','bedroom',0.20),('07:00','bedroom',0.27),('08:00','bedroom',0.06),
('09:00','bedroom',0.06),('10:00','bedroom',0.06),('11:00','bedroom',0.06),
('12:00','bedroom',0.06),('13:00','bedroom',0.06),('14:00','bedroom',0.06),
('15:00','bedroom',0.06),('16:00','bedroom',0.06),('17:00','bedroom',0.06),
('18:00','bedroom',0.06),('19:00','bedroom',0.20),('20:00','bedroom',0.20),
('21:00','bedroom',0.20),('22:00','bedroom',0.14),('23:00','bedroom',0.14);
