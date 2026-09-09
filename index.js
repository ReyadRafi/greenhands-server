import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import eventRoutes from "./src/routes/eventRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("🌱 GreenHands server is running");
});

app.use("/events", eventRoutes);

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});