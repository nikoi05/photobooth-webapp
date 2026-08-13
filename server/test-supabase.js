import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const bucket = process.env.SUPABASE_BUCKET_NAME;

console.log("URL:   ", url);
console.log("KEY:   ", key ? key.slice(0, 12) + "..." : "MISSING");
console.log("BUCKET:", bucket);

const supabase = createClient(url, key);

// ── 1. List buckets ───────────────────────────────────────────
const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("\n❌ listBuckets failed:", listError.message);
  process.exit(1);
}
console.log("\n✅ Buckets found:", buckets.map(b => b.name));

// ── 2. Confirm target bucket exists ──────────────────────────
const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
if (bucketError) {
  console.error(`\n❌ getBucket("${bucket}") failed:`, bucketError.message);
  process.exit(1);
}
console.log(`✅ Bucket "${bucketData.name}" accessible (public: ${bucketData.public})`);

// ── 3. Upload a test file (minimal 1×1 white JPEG) ───────────
const testPath = `_test/ping-${Date.now()}.jpg`;
// Smallest valid JPEG bytes
const testContent = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8AKwAB/9k=",
  "base64"
);

const { data: uploadData, error: uploadError } = await supabase.storage
  .from(bucket)
  .upload(testPath, testContent, { contentType: "image/jpeg", upsert: true });

if (uploadError) {
  console.error("\n❌ Upload failed:", uploadError.message);
  process.exit(1);
}
console.log(`\n✅ Upload succeeded: ${uploadData.path}`);

// ── 4. Get a signed URL (proves download works) ───────────────
const { data: signedData, error: signedError } = await supabase.storage
  .from(bucket)
  .createSignedUrl(testPath, 60); // 60 second expiry

if (signedError) {
  console.error("\n❌ Signed URL failed:", signedError.message);
} else {
  console.log(`✅ Signed URL generated:\n   ${signedData.signedUrl}`);
}

// ── 5. Delete the test file ───────────────────────────────────
const { error: deleteError } = await supabase.storage
  .from(bucket)
  .remove([testPath]);

if (deleteError) {
  console.error("\n❌ Delete failed:", deleteError.message);
  process.exit(1);
}
console.log(`✅ Test file deleted\n`);
console.log("🎉 All checks passed — Supabase storage is fully operational.");
