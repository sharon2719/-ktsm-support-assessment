# Post-Incident Review – INC-5521

**Incident:** Customers could not collect parcels
**Date:** 3 November 2026
**Service:** Parcel Locker API
**Status:** Service restored at 03:05 UTC. Permanent fix still open.

## 1. Summary

API update v2.14.0 added stricter checks. Older lockers on firmware 3.1.0 send the compartment number as text. The new API rejected this, so doors did not open.

Two lockers were confirmed affected: LK-1187 and LK-0933. We rolled back the update and service was restored at 03:05.

## 2. Timeline (UTC)

| Time | What happened |
| --- | --- |
| 01:57 | LK-1187 opened a door normally (HTTP 200) |
| 02:00 | API update v2.14.0 started |
| 02:03 | API update finished |
| 02:07 | LK-1187 failed with HTTP 422 (compartment error) |
| 02:09 | LK-0933 failed with the same error |
| 02:14 | Service Desk opened INC-5521 after customer reports |
| 03:05 | Service restored |

The investigation and rollback happened between 02:14 and 03:05. Exact times for these steps were not recorded in the information given.

## 3. Root cause

- The new update required the compartment number to be a whole number, for example `7`.
- Lockers on firmware 3.1.0 send it as text, for example `"07"`.
- The API rejected these requests with HTTP 422, so the doors did not open.

This was a compatibility problem between the new API and older locker firmware. We should review how updates are tested against older firmware.

## 4. Impact

- **Lockers:** 2 confirmed – LK-1187 and LK-0933. Customers at Westlands mall reported the problem, but the logs do not show which locker is there. The site of each locker is still to be confirmed.
- **Customers:** could not collect parcels from these lockers. The total number is still being checked.
- **Duration:** about 58 minutes, from the first failure at 02:07 to 03:05.
- **How we found out:** from customer reports. The errors were already in the logs before the ticket was opened.

## 5. What went well

- The logs clearly showed the error.
- Comparing the same locker before and after the update made the cause easy to find.
- Rolling back to the previous version restored service quickly.

## 6. Preventive actions

| # | Action | Proposed owner |
| --- | --- | --- |
| 1 | Change the API to accept the compartment as a number or as text like `"07"` | Development team |
| 2 | Add tests that use requests from older firmware | Development team |
| 3 | Add an alert when HTTP 422 errors go up after a release | Support / L2 |
| 4 | Check firmware compatibility before approving API changes | Change / Release team |
| 5 | Plan to upgrade older lockers to newer firmware | Device team |

## 7. Follow-up

1. Confirm the full list of affected lockers and customers.
2. Fix and test the API before releasing it again.
3. Hold a review meeting to agree on and track the actions above.
