import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.routes.js";
import cron from "node-cron";
import cleanupExpiredOutputs from "./services/cleanupService.js";
import cleanupExpiredShares from "./services/cleanupShared.js";
import cleanupOrphanedUploads from "./services/cleanupUploads.js";
import "./database/init.js";
import shareRoutes from "./routes/share.route.js";
dotenv.config();

const app = express();
cron.schedule("*/30 * * * *", async () =>{
    await cleanupExpiredOutputs();
});
cron.schedule("*/30 * * * *", async () =>{
    await cleanupExpiredShares();
});
cron.schedule("*/30 * * * *", async () =>{
    await cleanupOrphanedUploads();
});
app.use(cors());
app.use(express.json());
app.use("/output", express.static("output"));
app.use("/api/share", shareRoutes);


app.get("/", (req,res) =>{
    res.send("Server is running");
});
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
});