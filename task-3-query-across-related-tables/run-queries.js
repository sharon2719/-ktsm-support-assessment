// Runs setup.sql and queries.sql using Node's built-in SQLite (Node.js 22.13 or later)
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(":memory:");
db.exec(fs.readFileSync("setup.sql", "utf8"));

const queries = fs
  .readFileSync("queries.sql", "utf8")
  .split(";")
  .filter((q) => q.includes("SELECT"));

queries.forEach((query, i) => {
  console.log(`\nQuery ${i + 1}:`);
  console.table(db.prepare(query).all());
});