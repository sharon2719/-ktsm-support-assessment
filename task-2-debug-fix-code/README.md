# Task 2: Debug and Fix Code

## The two complaints

### 1. Codes stay valid about 3 hours too long in Kenya

- `expiresAt.toLocaleString()` saves the expiry in the **server's local time**, with no timezone. In Kenya that is UTC+3, for example `11/5/2026, 1:00:00 PM`.
- `isExpired()` adds `" UTC"` to that text and reads it back as **UTC time**.
- So 1:00 PM Kenya time is read as 1:00 PM UTC, which is 4:00 PM in Kenya.
- The code expires **3 hours late**. This is exactly the UTC+3 offset.

**Fix:** save the expiry with `toISOString()` (always UTC, for example `2026-11-05T10:00:00.000Z`) and compare dates directly.

### 2. Some codes are shorter than 6 digits

- `Math.floor(Math.random() * 1000000)` gives a number from 0 to 999999.
- Any number below 100000 has fewer than 6 digits, for example `4821`.
- About 1 in 10 codes is too short, and the keypad rejects it.

**Fix:** pad the number with zeros to 6 digits: `4821` becomes `"004821"`.

## Other bugs and risks

| # | Problem | Why it matters | Fix |
| --- | --- | --- | --- |
| 3 | Missing or wrong `holdDays` gives `Invalid Date` | `isExpired()` then always returns `false`, so the **code never expires** | Check `holdDays` is a positive whole number |
| 4 | `toLocaleString()` format depends on server settings | The date may not read back correctly on another server | Use `toISOString()` |
| 5 | `Math.random()` is not secure | Codes can be predicted, so someone could guess a code | Use `crypto.randomInt()` |
| 6 | `usedCodes` is never cleared | The list grows forever and `includes()` gets slower. When most codes are used, the `while` loop **never ends** | Use a `Set` and free codes with `releaseCode()` |
| 7 | `usedCodes` is only in memory | It is lost on restart and not shared between servers, so duplicate codes are possible | In production, store codes in the database with a unique rule |
| 8 | `<` instead of `<=` | A code still works at the exact second it expires | Use `<=` |

I saw risk 6 happen while testing. When I forced `Math.random()` to return the same value, the second pickup got stuck in the `while` loop.

## What I changed

`pickup.js` is the corrected version:
- Codes come from `crypto.randomInt()` and are padded to 6 digits.
- Expiry is calculated in milliseconds and saved in UTC with `toISOString()`.
- `holdDays` is checked before use.
- Used codes are kept in a `Set`, and `releaseCode()` frees a code after collection or expiry.
- `createPickup()` and `isExpired()` accept an optional `now` date, so tests can use a fixed time.

`pickup-original.js` is the code from the brief, kept for comparison.

## Tests

`pickup.test.js` uses Node's built-in test runner (`node:test`), so nothing needs to be installed. The tests run in Kenya time (`Africa/Nairobi`), where the bug was reported.

| Test | Catches |
| --- | --- |
| Code is always 6 digits, even for small numbers | Bug 2 (short codes) |
| Code expires exactly at the end of the hold period | Bug 1 (3 hours late) |
| Expiry is stored in UTC format | Bugs 1 and 4 |
| A code already in use is not given out again | Risk 6 (duplicates) |
| Invalid holdDays is rejected | Risk 3 (code never expires) |

Run the tests (Node.js 18 or later):

```bash
npm test
```

Result:

```

> task-2-debug-and-fix@1.0.0 test
> node --test

✔ code is always 6 digits, even for small numbers (1.0624ms)
✔ code expires exactly at the end of the hold period (0.361ms)
✔ expiry is stored in UTC format (0.1377ms)
✔ a code already in use is not given out again (0.1608ms)
✔ invalid holdDays is rejected (0.4045ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 122.9073
```

I also checked the original code in Kenya time. It returned a 4-digit code (`4821`), and one minute after the expiry time, `isExpired()` still returned `false`.

## AI assistance

I used ChatGPT and Claude to help review the code, discuss the bugs and write the tests. I ran the tests myself and checked that the original code fails in the same way the customers reported.
