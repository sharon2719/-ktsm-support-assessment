
// Run tests in Kenya time (UTC+3), where the bug was reported
process.env.TZ = "Africa/Nairobi";

import test from "node:test";
import assert from "node:assert/strict";

import {
  createPickup,
  isExpired,
  releaseCode
} from "./pickup.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Bug 1: Codes like 4821 had only 4 digits
test("code is always 6 digits, even for small numbers", () => {
  const pickup = createPickup(
    { id: "P1", holdDays: 2 },
    new Date(),
    () => 4821
  );

  assert.equal(pickup.code, "004821");

  releaseCode(pickup.code);
});

// Bug 2: Codes stayed valid 3 hours too long in Kenya (UTC+3)
test("code expires exactly at the end of the hold period", () => {
  const created = new Date("2026-11-03T10:00:00Z");

  const pickup = createPickup(
    { id: "P2", holdDays: 2 },
    created
  );

  const expiryTime = created.getTime() + 2 * DAY_MS;

  const justBefore = new Date(expiryTime - 60 * 1000);
  const exactlyAtExpiry = new Date(expiryTime);
  const justAfter = new Date(expiryTime + 60 * 1000);

  assert.equal(isExpired(pickup, justBefore), false);
  assert.equal(isExpired(pickup, exactlyAtExpiry), true);
  assert.equal(isExpired(pickup, justAfter), true);

  releaseCode(pickup.code);
});

// Check that expiry is stored in UTC format
test("expiry is stored in UTC format", () => {
  const created = new Date("2026-11-03T10:00:00Z");

  const pickup = createPickup(
    { id: "P3", holdDays: 1 },
    created
  );

  assert.equal(
    pickup.expiresAt,
    "2026-11-04T10:00:00.000Z"
  );

  releaseCode(pickup.code);
});

// Risk: Duplicate codes
test("a code already in use is not given out again", () => {
  const values = [111111, 111111, 222222];

  const generateRandom = () => values.shift();

  const first = createPickup(
    { id: "P4", holdDays: 1 },
    new Date(),
    generateRandom
  );

  const second = createPickup(
    { id: "P5", holdDays: 1 },
    new Date(),
    generateRandom
  );

  assert.equal(first.code, "111111");
  assert.equal(second.code, "222222");

  releaseCode(first.code);
  releaseCode(second.code);
});

// Risk: Missing or invalid holdDays
test("invalid holdDays is rejected", () => {
  assert.throws(() => createPickup({ id: "P6" }));
  assert.throws(() => createPickup({ id: "P7", holdDays: -1 }));
  assert.throws(() => createPickup({ id: "P8", holdDays: "2" }));
  assert.throws(() => createPickup({ id: "P9", holdDays: 0 }));
});
