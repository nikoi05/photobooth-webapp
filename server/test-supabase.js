import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const bucket = process.env.SUPABASE_BUCKET_NAME;

console.log("URL:   ", url);
console.log("KEY:   ", key ? key.slice(0, 12) + "..." : "MISSING");
console.log("BUCKET:", bucket);

const supabase = createClient(url, key);

// List all buckets
const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("\n❌ listBuckets failed:", listError.message);
} else {
  console.log("\n✅ Buckets found:", buckets.map(b => b.name));
}

// Check the specific bucket
const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
if (bucketError) {
  console.error(`\n❌ getBucket("${bucket}") failed:`, bucketError.message);
} else {
  console.log(`\n✅ Bucket "${bucketData.name}" is accessible (public: ${bucketData.public})`);
}
