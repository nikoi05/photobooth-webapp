
import processImage from "../services/image-processing.service.js";
export const uploadPhotos =  async (req, res)=>{
 console.log("req.files", req.files);
   try{

     const result = await processImage(req.files, req.body.FormatId, req.body.filterId);
    
      return res.status(200).json({
         success: true,
         data: result
      });

   }catch(error){
    console.error("Error processing upload:", error);
    res.status(500).json({ error: "Failed to process upload" });
   }
}