import { API_URL } from "../config/api.js";
export async function uploadPhotoStrip(photos,filter,format){
        const formData = new FormData();


        photos.forEach((photo)=>{
            formData.append("photos",photo.file);
        })
        formData.append("FormatId",format);
        formData.append("filterId",filter);

    
         const response = await fetch(`${API_URL}/api/upload/generate`,{
                method: "POST",
                body:formData,
         });

        const data =await response.json();
        console.log(data);
        return data
     
    }
   