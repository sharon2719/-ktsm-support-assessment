# Task 3: Query Across Related Tables

## Files

| File | What it is |
| --- | --- |
| `setup.sql` | The tables and sample data from the brief |
| `queries.sql` | My two queries |
| `run-queries.js` | Runs both files with Node.js, so nothing extra needs installing |

## How to run

From the main project folder (Node.js 22.13 or later):

```bash
npm run task3
```

This runs `run-queries.js`, which loads `setup.sql` and runs `queries.sql` using Node's built-in SQLite, so nothing extra needs installing. Node may show a warning that SQLite is experimental. This is normal and does not affect the results.

I ran both queries against the sample data, and the results below are the real output.

---

## 1. Query: delivered parcels waiting to be collected

```sql
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
```

## 2. Results

| tracking_number | destination_name | locker_serial_number | compartment_number | compartment_status |
| --- | --- | --- | --- | --- |
| EV100001 | Westlands Mall | LK-1187 | 7 | occupied |

**Why the other shipments are not in the list:**

| Shipment | Tracking number | Result | Reason |
| --- | --- | --- | --- |
| 5001 | EV100001 | Included | Destination 12, delivered, not collected, compartment occupied |
| 5002 | JD200002 | Excluded | Still in transit. It has no delivery time and no compartment |
| 5003 | EV100003 | Excluded | Its compartment is `out_of_order`, not `occupied` |
| 5004 | JD200004 | Excluded | Destination is 15 (Garden City), not 12 |
| 5005 | EV100005 | Excluded | Already collected. `collected_at` has a value |

## 3. The query in simple English

Think of it as four lists that are linked by ID numbers:
- **Shipments:** each parcel and its tracking number
- **Destinations:** the site name, like Westlands Mall
- **Compartments:** the box in the locker where the parcel sits
- **Lockers:** the locker's serial number, like LK-1187

The query works in these steps:

1. **Start with the parcels.** Look at every shipment.
2. **Add the site name.** Use the destination ID to find the site.
3. **Add the compartment.** Use the compartment ID to find which box the parcel is in.
4. **Add the locker.** Use the compartment's locker ID to find the locker's serial number.
5. **Keep only the parcels we want:**
    - at destination 12 (Westlands Mall)
    - sent out (has a start time)
    - put in the locker (has a delivery time)
    - not picked up yet (no collection time)
    - in a box marked occupied
6. **Show five columns:** tracking number, site, locker, box number and box status.

The result is the list of parcels sitting in Westlands Mall lockers, waiting for customers.

---

## 4. Second query: parcels stuck in out-of-order compartments

```sql
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
```

**Result:**

| locker_serial_number | stuck_parcels |
| --- | --- |
| LK-0933 | 1 |

This is shipment EV100003, in compartment 15 of locker LK-0933. It was delivered on 1 November and has not been collected.

### Why this list matters to the support team

- **The customer probably cannot get their parcel.** The box is out of order, so the door may not open.
- **The customer may not have complained yet.** This list lets us act first, before they call.
- **It shows where to send help.** Grouping by locker tells the field team which lockers to visit and how many parcels are stuck in each.
- **Parcels can run out of time.** A stuck parcel can pass its hold period and be returned to the sender, even though the customer did nothing wrong.

### Link to Task 1

The `lockers` table shows that **both LK-1187 and LK-0933 are at Westlands Mall**. Also, compartment 15 on LK-0933 is the same compartment that failed in the Task 1 logs (`compartment="15"`). Before sending a technician, I would check whether this compartment was marked out of order because of the INC-5521 software problem, and not because of a real fault.

---

## AI assistance

I used ChatGPT and Claude to help explain the queries. I ran both queries against the sample data myself to confirm the results.