-- Query 1: Delivered parcels at destination 12 that are waiting to be collected
SELECT
  s.tracking_number,
  d.name          AS destination_name,
  l.serial_number AS locker_serial_number,
  c.number        AS compartment_number,
  c.status        AS compartment_status
FROM shipments s
JOIN destinations d ON s.destination_id = d.id
JOIN compartments c ON s.compartment_id = c.id
JOIN lockers l      ON c.locker_id = l.id
WHERE s.destination_id = 12
  AND s.started_at IS NOT NULL
  AND s.delivered_at IS NOT NULL
  AND s.collected_at IS NULL
  AND c.status = 'occupied';

-- Query 2: Uncollected parcels stuck in out_of_order compartments, counted per locker
SELECT
  l.serial_number AS locker_serial_number,
  COUNT(s.id)     AS stuck_parcels
FROM shipments s
JOIN compartments c ON s.compartment_id = c.id
JOIN lockers l      ON c.locker_id = l.id
WHERE s.delivered_at IS NOT NULL
  AND s.collected_at IS NULL
  AND c.status = 'out_of_order'
GROUP BY l.serial_number
ORDER BY stuck_parcels DESC;
