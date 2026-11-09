
import { randomInt } from "node:crypto";

const usedCodes = new Set();
const DAY_MS = 24 * 60 * 60 * 1000;

function createPickup(parcel, now = new Date(), generateRandom = randomInt) {
  // Validate parcel hold period
  if (!Number.isInteger(parcel.holdDays) || parcel.holdDays <= 0) {
    throw new Error("Invalid holdDays");
  }

  // Generate a unique 6-digit pickup code
  let code;

  do {
    code = String(generateRandom(0, 1000000)).padStart(6, "0");
  } while (usedCodes.has(code));

  usedCodes.add(code);

  // Calculate expiry time and store it in UTC
  const expiresAt = new Date(
    now.getTime() + parcel.holdDays * DAY_MS
  );

  return {
    parcelId: parcel.id,
    code,
    expiresAt: expiresAt.toISOString()
  };
}

// Check whether the pickup code has expired
function isExpired(pickup, now = new Date()) {
  return new Date(pickup.expiresAt) <= now;
}

// Release a code so it can be reused
function releaseCode(code) {
  usedCodes.delete(code);
}

export { createPickup, isExpired, releaseCode };
