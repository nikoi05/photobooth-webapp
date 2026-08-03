import fs from "fs/promises";
import path from "path";
import db from "../database/database.js";

const OUTPUT_FOLDER = "./output";


export default async function cleanupExpiredShares(){

    const now = Date.now();

    const expiredShares = db.prepare(`
        SELECT *
        FROM shares
        WHERE expires_at < ?
    `).all(now);


    for(const share of expiredShares){

        const filePath = path.join(
            OUTPUT_FOLDER,
            share.filename
        );


        try{
            await fs.unlink(filePath);

            console.log(
                "Deleted file:",
                share.filename
            );

        } catch(error){

            console.log(
                "File already missing:",
                share.filename
            );
        }


        db.prepare(`
            DELETE FROM shares
            WHERE share_id = ?
        `).run(share.share_id);


        console.log(
            "Removed share:",
            share.share_id
        );
    }
}