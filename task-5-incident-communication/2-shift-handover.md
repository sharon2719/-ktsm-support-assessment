# Shift Handover Note

**Handover time:** 08:00 UTC
**Incident:** INC-5521 – Customers cannot collect parcels
**Lockers:** LK-1187 and LK-0933. Customers at Westlands mall reported the problem. The logs do not show which locker is at Westlands, so please confirm the site of each locker.

## 1. Current status

Service was restored at 03:05 UTC. Lockers are working, but some follow-up work is still open.

**The permanent fix has not been deployed yet.**

## 2. What happened

- At 02:00, API update v2.14.0 (CR-882) was released. It added stricter checks.
- Older lockers on firmware 3.1.0 send the compartment number as text, for example `"07"`.
- The new API only accepts whole numbers, for example `7`.
- So the API rejected door-open requests from these lockers with error HTTP 422.

## 3. What I did

1. Checked the API and device logs.
2. Found the compartment error.
3. Rolled back v2.14.0 to the previous version.
4. Confirmed both lockers were working again at 03:05.

## 4. What is still open

- [ ] Confirm the site of LK-1187 and LK-0933.
- [ ] Check the locker list for all lockers on firmware 3.1.0.
- [ ] Check the logs for other failed door-open requests.
- [ ] Confirm how many customers were affected, and ask the Service Desk to follow up with them.
- [ ] Keep v2.14.0 on hold. Do not release it again until it is fixed and tested.
- [ ] Book a review meeting with the development and release teams.

## 5. What to watch

Watch the logs for:
- HTTP 422 errors on `/v1/lockers/{lockerId}/doors/open`
- Door-open failures that repeat
- Reports from other sites

If the problem comes back, first check if v2.14.0 was released again.

## 6. Your next steps

1. Keep monitoring the logs.
2. Finish the open checks above.
3. Give the Service Manager an update, and agree when the next update is due.
