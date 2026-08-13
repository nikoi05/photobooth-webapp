/**
 * GET /api/test/supabase
 *
 * Checks three things:
 *   1. Supabase client initialises without throwing
 *   2. The storage bucket defined in SUPABASE_BUCKET exists and is reachable
 *   3. A small text file can be uploaded to the bucket and then deleted
 *
 * Safe to remove or gate behind an env flag before going to production.
 */

import { Router } from "express";
import supabase from "../database/supabase.js";

const router = Router();
const BUCKET = process.env.SUPABASE_BUCKET_NAME;

router.get("/supabase", async (req, res) => {
  const results = {
    client:  { ok: false, detail: null },
    bucket:  { ok: false, detail: null },
    upload:  { ok: false, detail: null },
  };

  // ── 1. Client check ──────────────────────────────────────────
  try {
    // Just accessing the storage API object is enough to confirm the
    // client was initialised with valid-looking credentials.
    results.client.ok = !!supabase.storage;
    results.client.detail = "Client initialised";
  } catch (err) {
    results.client.detail = err.message;
    return res.status(500).json({ success: false, results });
  }

  // ── 2. Bucket reachability ───────────────────────────────────
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET);
    if (error) throw error;
    results.bucket.ok = true;
    results.bucket.detail = `Bucket "${data.name}" found (public: ${data.public})`;
  } catch (err) {
    results.bucket.detail = err.message;
    return res.status(500).json({ success: false, results });
  }

  // ── 3. Upload + delete round-trip ────────────────────────────
  const testPath = `_test/ping-${Date.now()}.txt`;
  const testContent = Buffer.from("supabase connectivity test");

  try {
    // Upload
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(testPath, testContent, { contentType: "text/plain", upsert: true });

    if (uploadError) throw uploadError;

    // Delete
    const { error: deleteError } = await supabase.storage
      .from(BUCKET)
      .remove([testPath]);

    if (deleteError) throw deleteError;

    results.upload.ok = true;
    results.upload.detail = `Uploaded and deleted "${testPath}" successfully`;
  } catch (err) {
    results.upload.detail = err.message;
    return res.status(500).json({ success: false, results });
  }

  return res.json({ success: true, results });
});

export default router;
