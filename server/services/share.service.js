import crypto from 'crypto';
import db from "../database/database.js";


const TTL = 2*60*60*1000; // 2 hours in milliseconds
const test =60*1000; // 1 minute in milliseconds

export default function createShare(filename){
    const shareID = crypto.randomUUID();
    const createdAt = Date.now();
    const expiresAt = createdAt + TTL;

    db.prepare(`
        INSERT INTO shares (share_id, filename, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    `).run(shareID, filename, createdAt, expiresAt);

    return { shareID, expiresAt };

}

export  function getShare(shareID){
    const share = db.prepare(`
        SELECT * FROM shares WHERE share_id = ?
    `).get(shareID); 

    return share;}