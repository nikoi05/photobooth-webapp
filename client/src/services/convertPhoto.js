import heic2any from "heic2any";
/** converts raw files from ios and other files into a unified jpeg format */
export const convertToJpeg = async (photos)=>{
    const photoarray =Array.from(photos);
    // heics
    const isHeic = photos.file.name.toLowerCase().endsWith(".heic") || file.type ==="image/heic";
    if(isHeic){
        try{
            const 
        }catch(error){
            console.error("HEIC conversion failed:", error)
        }
    }
}