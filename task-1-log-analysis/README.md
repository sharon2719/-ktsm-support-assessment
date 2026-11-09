# Task 1: Log Analysis – INC-5521

## Root Cause

The issue started after API release v2.14.0, which introduced stricter request validation (CR-882).

Older lockers running firmware 3.1.0 send compartment numbers as strings, for example `"07"`. The new release expects integers, so these requests are rejected with HTTP 422.

Evidence from the logs:

- 01:57 – LK-1187 opened a door using `compartment="07"` and received HTTP 200.
- 02:03 – Release v2.14.0 finished deploying.
- 02:07 – LK-1187 sent a request with `compartment="07"` and received HTTP 422 with the error `compartment: expected integer`.
- The device retried the request and eventually failed.
- 02:09 – LK-0933, also running firmware 3.1.0, experienced the same error.
- LK-2041 and LK-3310 continued working because they sent compartment numbers as integers.

This suggests that the lockers did not change. The API validation changed, making it incompatible with the request format used by older firmware.

## Immediate Action

Roll back API release v2.14.0 to the previous stable release, after confirming that the deployment caused the issue and that rollback is safe.

After the rollback:

1. Test door opening on LK-1187 and LK-0933 and confirm successful responses.
2. Monitor the API logs for further 422 errors.
3. Update the Service Manager and Service Desk once service is restored.

I would choose rollback because the previous release accepted the older request format, making it a practical way to restore service quickly.

## Permanent Fix

Update the API to accept both integers and numeric strings, converting valid strings into integers before processing.

For example:

```javascript
function validateCompartment(compartment) {
  // Only allow a number or a string containing digits
  const isDigits =
    typeof compartment === "string" && /^\d+$/.test(compartment);

  if (typeof compartment !== "number" && !isDigits) {
    throw new Error("Invalid compartment number");
  }

  const number = Number(compartment);

  if (!Number.isInteger(number) || number <= 0) {
    throw new Error("Invalid compartment number");
  }

  return number;
}

// Examples
console.log(validateCompartment("07")); // 7
console.log(validateCompartment(9));    // 9
```

I would also add tests for both string and integer values, including invalid inputs, and test API changes against older firmware before deployment.

## Finding Other Affected Lockers

### 1. Lockers already failing

I created a Node.js script called `find-affected-lockers.js` that reads the API logs and identifies lockers returning HTTP 422 with the compartment validation error.

To run it:

```bash
node find-affected-lockers.js
```

Expected output from the supplied logs:

```text
Affected lockers:
LK-1187 - Firmware 3.1.0
LK-0933 - Firmware 3.1.0
Total affected: 2
```

### 2. Lockers that may be affected

Some lockers running firmware 3.1.0 may not have attempted to open a door since the deployment. I would also check the locker inventory to identify these devices.

For example, assuming the inventory is stored in a database table called `lockers`:

```sql
SELECT locker_id, firmware_version
FROM lockers
WHERE firmware_version = '3.1.0';
```

The Node.js script identifies lockers that have already failed, while the inventory query identifies lockers that could potentially experience the same issue.

## AI Assistance

I used ChatGPT to assist with reviewing the logs, and refining the JavaScript implementation. I reviewed the suggestions, tested the code and selected the approach based on my understanding of the incident.