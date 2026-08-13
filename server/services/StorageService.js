import supabase from '../database/supabase.js';
import dotenv from 'dotenv';
const BUCKET = process.env.SUPABASE_BUCKET_NAME;

export async function uploadImage (buffer, filepath, contentType = "image/jpeg"){
    const {data, error} = await supabase.storage.from(BUCKET).upload(filePath, buffer , { contentType, upsert: false});
    
    if(error){
        throw new Error(`Supabase Storage upload Failed: ${error.message} ` );
    }
    return data;
}

export async function deleteImage(filePath) {
    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([filePath]);

    if (error) {
        throw new Error(`Supabase Storage delete failed: ${error.message}`);
    }
}