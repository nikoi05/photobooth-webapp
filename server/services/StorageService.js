import supabase from "../database/supabase.js";

const BUCKET = process.env.SUPABASE_BUCKET_NAME;

export async function uploadImage(
    buffer,
    filePath,
    contentType = "image/jpeg"
) {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
            contentType,
            upsert: false
        });

    if (error) {
        throw new Error(
            `Supabase Storage upload failed: ${error.message}`
        );
    }

    return data;
}

export async function deleteImage(filePath) {
    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([filePath]);

    if (error) {
        throw new Error(
            `Supabase Storage delete failed: ${error.message}`
        );
    }
}

export async function getSignedImageUrl(
    filePath,
    expiresIn = 600
) {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        throw new Error(
            `Failed to create signed URL: ${error.message}`
        );
    }

    return data.signedUrl;
}