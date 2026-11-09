
const fs = require("fs");
// Read the log file
if (!fs.existsSync("incident.log")) {
  console.log("Error: incident.log was not found.");
  process.exit(1);
}

const logs = fs.readFileSync("incident.log", "utf8");

// Store affected lockers and their firmware
const affected = new Map();

for (const line of logs.split(/\r?\n/)) {
  if (
    line.includes("doors/open 422") &&
    line.includes("compartment: expected integer")
  ) {
    const locker = line.match(/LK-\d+/)?.[0];
    const firmware = line.match(/firmware=([\d.]+)/)?.[1];

    if (locker) {
      affected.set(locker, firmware || "Unknown");
    }
  }
}

console.log("Affected lockers:");

for (const [locker, firmware] of affected) {
  console.log(`${locker} - Firmware ${firmware}`);
}

console.log("Total affected:", affected.size);
