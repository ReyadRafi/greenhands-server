import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// POST /events - create a new event
router.post("/", async (req, res) => {
  try {
    const eventData = req.body;

    // Basic backend-side safety check: reject past dates
    // (client already blocks this via react-datepicker, but never trust the client alone)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const submittedDate = new Date(eventData.eventDate);

    if (submittedDate < today) {
      return res.status(400).json({ message: "Event date must be in the future" });
    }

    const result = await Event.create(eventData);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

export default router;