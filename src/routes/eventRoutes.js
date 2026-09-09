import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// GET /events - fetch all upcoming events (future dates only)
// Supports optional query params: ?type=Cleanup&search=beach
router.get("/", async (req, res) => {
  try {
    const { type, search } = req.query;

    const query = {
      eventDate: { $gte: new Date() }, // only future events
    };

    if (type && type !== "all") {
      query.eventType = type;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" }; // case-insensitive partial match
    }

    const events = await Event.find(query).sort({ eventDate: 1 }); // soonest first
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET /events/:id - fetch a single event's details
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// POST /events - create a new event
router.post("/", async (req, res) => {
  try {
    const eventData = req.body;

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