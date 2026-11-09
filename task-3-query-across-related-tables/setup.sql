-- Tables and sample data from the brief
CREATE TABLE destinations (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  city VARCHAR(50)
);

CREATE TABLE lockers (
  id INT PRIMARY KEY,
  destination_id INT NOT NULL REFERENCES destinations(id),
  serial_number VARCHAR(10),
  status VARCHAR(20) -- 'online', 'offline'
);

CREATE TABLE compartments (
  id INT PRIMARY KEY,
  locker_id INT NOT NULL REFERENCES lockers(id),
  number INT,
  size CHAR(1), -- 'S', 'M', 'L'
  status VARCHAR(20) -- 'available', 'occupied', 'reserved', 'out_of_order'
);

CREATE TABLE shipments (
  id INT PRIMARY KEY,
  tracking_number VARCHAR(20),
  compartment_id INT REFERENCES compartments(id),
  destination_id INT NOT NULL REFERENCES destinations(id),
  status VARCHAR(20), -- 'in_transit', 'delivered', 'collected'
  started_at TIMESTAMP,
  delivered_at TIMESTAMP,
  collected_at TIMESTAMP
);

INSERT INTO destinations VALUES
  (12, 'Westlands Mall', 'Nairobi'),
  (15, 'Garden City', 'Nairobi');

INSERT INTO lockers VALUES
  (101, 12, 'LK-1187', 'online'),
  (102, 12, 'LK-0933', 'online'),
  (201, 15, 'LK-2041', 'online');

INSERT INTO compartments VALUES
  (1, 101, 7, 'M', 'occupied'),
  (2, 101, 8, 'S', 'available'),
  (3, 102, 15, 'L', 'out_of_order'),
  (4, 201, 4, 'M', 'occupied');

INSERT INTO shipments VALUES
  (5001, 'EV100001', 1, 12, 'delivered', '2026-11-02 08:10', '2026-11-02 14:30', NULL),
  (5002, 'JD200002', NULL, 12, 'in_transit', '2026-11-03 09:00', NULL, NULL),
  (5003, 'EV100003', 3, 12, 'delivered', '2026-11-01 07:45', '2026-11-01 12:05', NULL),
  (5004, 'JD200004', 4, 15, 'delivered', '2026-11-02 10:00', '2026-11-02 16:20', NULL),
  (5005, 'EV100005', 1, 12, 'collected', '2026-10-30 08:00', '2026-10-30 13:00', '2026-10-31 09:15');
