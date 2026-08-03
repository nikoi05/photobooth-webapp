import db from "./database.js";

db.exec(`


CREATE TABLE if NOT EXISTS shares (
    share_id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);
`);

console.log("Database initialized.");
