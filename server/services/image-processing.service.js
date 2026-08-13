    import sharp from "sharp";
    import fs from "fs/promises";
    import path from "path";
    import crypto from "crypto";
    import { applyFilter } from "./filterService.js";
    import createShare from "./share.service.js";
import strip4Layout from "./layouts/strip-4-layout.js";
import strip3Layout from "./layouts/strip-3-layouts.js";
import strip2Layout from "./layouts/strip-2-layout.js";
import { uploadImage } from "./StorageService.js";

    export  default async function processImage(filePath, formatId, filterId) {
        //decider
            let layout;
            let images = [];
        try{

            await fs.mkdir("output", { recursive: true });
            // load images using sharp

            for(const file of filePath){
                images.push(sharp(file.path));
            }
            //resize image to 1080x680
          

            
                switch(formatId){
                    case "strip-2":
                        layout = strip2Layout;
                        break;
                    case "strip-3":
                        layout = strip3Layout;
                        break;
                    case "strip-4":
                        layout = strip4Layout;
                        break;
                    default:
                        layout = strip4Layout
                        break;
                }
            //load the template
            const template = sharp(layout.template);
            const composite  = [];

            for(let i=0; i<images.length; i++){
                const filteredImage = await applyFilter(images[i], filterId);
                images[i] = filteredImage;
                 const resizePhoto = await images[i].resize(layout.photowidth, layout.photoheight, {
                fit: "cover",
            }).toBuffer();
                composite.push({
                    input: resizePhoto,
                    top: layout.slots[i].top,
                    left: layout.slots[i].left
                });
            }
             
            // the filepath uuid for the output file
            const filename = `${crypto.randomUUID()}.jpg`;
            //generate the final image directly to buffer
            const outputbuffer = await template.composite(composite).jpeg().toBuffer();
            const outputPath = path.join("output", filename);
            //path inside the supabase storage
            const storagePath = `outputs/${filename}`;
            
            await uploadImage(outputbuffer,storagePath,"image/jpeg");

            const share = await createShare(storagePath);

            //delete temporary uploadedfiles
            for(const file of filePath){
                  try {
                await fs.unlink(file.path);
                console.log(`Deleted file: ${file.path}`);
            } catch (err) {
                console.error(
                    `Error deleting file ${file.path}:`,
                    err
                );
            }
            }
             return {
            success: true,
            message: "Image processed successfully",

            filename,

            shareID: share.shareID,

            expiresAt: share.expiresAt,

            storagePath
        };


        }catch(error){
            console.error("Error processing image:", error);
            throw error;
        }

    }   