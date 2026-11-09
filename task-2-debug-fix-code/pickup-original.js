// Original code from the brief (kept for reference, do not use)
const usedCodes = [];
function createPickup(parcel) {
  let code = String(Math.floor(Math.random() * 1000000));
  while (usedCodes.includes(code)) {
    code = String(Math.floor(Math.random() * 1000000));
  }
  usedCodes.push(code);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parcel.holdDays);
  return { parcelId: parcel.id, code, expiresAt: expiresAt.toLocaleString() };
}
function isExpired(pickup) {
  return new Date(pickup.expiresAt + " UTC") < new Date();
}
module.exports = { createPickup, isExpired };
