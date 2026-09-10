import express from "express";
import JoinedEvent from "../models/JoinedEvent.js";
import Event from "../models/Event.js";

const router = express.Router();

// POST /joined-events - join an event
router.post("/", async (req, res) => {
  try {
    const { eventId, userEmail } = req.body;

    if (!eventId || !userEmail) {
      return res.status(400).json({ message: "eventId and userEmail are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prevent joining your own event (optional but sensible business rule)
    if (event.creatorEmail === userEmail) {
      return res.status(400).json({ message: "You cannot join an event you created" });
    }

    const joinedEvent = await JoinedEvent.create({
      eventId,
      userEmail,
      eventTitle: event.title,
      eventThumbnail: event.thumbnail,
      eventLocation: event.location,
      eventType: event.eventType,
      eventDate: event.eventDate,
    });

    res.status(201).json(joinedEvent);
  } catch (error) {
    // Duplicate key error from our unique index = already joined
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already joined this event" });
    }
    console.error(error);
    res.status(500).json({ message: "Failed to join event" });
  }
});

// GET /joined-events?email=... - get all events a user has joined, sorted by event date
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "email query param is required" });
    }

    const joinedEvents = await JoinedEvent.find({ userEmail: email }).sort({
      eventDate: 1, // sorted by event date, as required
    });

    res.status(200).json(joinedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch joined events" });
  }
});

// GET /joined-events/check?eventId=...&email=... - check if a user already joined a specific event
router.get("/check", async (req, res) => {
  try {
    const { eventId, email } = req.query;
    const existing = await JoinedEvent.findOne({ eventId, userEmail: email });
    res.status(200).json({ joined: !!existing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to check join status" });
  }
});

export default router;