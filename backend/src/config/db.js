const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const databaseFile = process.env.DATABASE_FILE || path.join(__dirname, "../../db/task_manager.sqlite");
const schemaPath = path.join(__dirname, "../../db/schema.sql");

const db = new Database(databaseFile);
db.pragma("foreign_keys = ON");

function normalizeSql(sql) {
  return sql.replace(/\$\d+/g, "?");
}

function query(text, params = []) {
  const sql = normalizeSql(text).trim();
  const statement = db.prepare(sql);
  const command = sql.split(/\s+/)[0].toUpperCase();

  if (command === "SELECT" || command === "PRAGMA") {
    return { rows: statement.all(params) };
  }

  if (sql.includes("RETURNING")) {
    return { rows: statement.all(params) };
  }

  const result = statement.run(params);
  return { rows: [], rowCount: result.changes, lastInsertRowid: result.lastInsertRowid };
}

function initDatabase() {
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  db.exec(schemaSql);
}

async function testConnection() {
  initDatabase();
  query("SELECT 1");
}

module.exports = {
  db,
  query,
  testConnection,
};
