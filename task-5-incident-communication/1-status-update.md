# Status Update to the Service Manager

**INC-5521 – Service restored – 03:10 UTC**

**Impact:** Customers at Westlands mall could not collect parcels. Two lockers failed: LK-1187 and LK-0933. We are still checking how many customers were affected.

**Cause:** The API update released at 02:00 added stricter checks. These checks rejected the compartment numbers that older lockers send.

**Status:** We rolled back the update. Service was restored at 03:05. Both lockers are working again.

**Next steps:**
1. Find any other lockers on the same older firmware.
2. Confirm which customers were affected.
3. Fix and test the update before releasing it again.

The next engineer will keep monitoring and update you on any changes.
