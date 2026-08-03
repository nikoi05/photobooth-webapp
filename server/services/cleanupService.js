import fs from "fs/promises";
import path from "path";

const OUTPUT_FOLDER = "./output";

const EXPIRATION = 2 * 60 * 60 * 1000;
const ttl = 60*1000; //test


export default async function cleanupExpiredOutputs(){

    const files = await fs.readdir(OUTPUT_FOLDER);

    const now = Date.now();


    for(const file of files){

        const filePath = path.join(
            OUTPUT_FOLDER,
            file
        );

        const stats = await fs.stat(filePath);

        const age = now - stats.birthtimeMs;


        if(age > EXPIRATION){

            await fs.unlink(filePath);

            console.log(
                "Expired:",
                file
            );
        }
    }
}