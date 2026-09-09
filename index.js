import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local Vite dev server
      // we'll add the live Firebase URL here once deployed
    ],
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// Root route — useful sanity check
app.get("/", (req, res) => {
  res.send("🌱 GreenHands server is running");
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});