import crypto from "crypto";
import supabase from "../database/supabase.js";

const TTL = 2 * 60 * 60 * 1000; // 2 hours

export default async function createShare(storagePath) {
    const shareID = crypto.randomUUID();

    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + TTL);

    const { error } = await supabase
        .from("shares")
        .insert({
            share_id: shareID,
            storage_path: storagePath,
            created_at: createdAt.toISOString(),
            expires_at: expiresAt.toISOString()
        });

    if (error) {
        throw new Error(`Failed to create share: ${error.message}`);
    }

    return {
        shareID,
        expiresAt: expiresAt.getTime()
    };
}

export async function getShare(shareID) {
    const { data, error } = await supabase
        .from("shares")
        .select("*")
        .eq("share_id", shareID)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to get share: ${error.message}`);
    }

    return data;
}