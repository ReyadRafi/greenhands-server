import express from "express";
import JoinedEvent from "../models/JoinedEvent.js";
import Event from "../models/Event.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyEmail from "../middlewares/verifyEmail.js";

const router = express.Router();

// POST /joined-events - requires auth
router.post("/", verifyToken, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userEmail = req.decodedEmail;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

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
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already joined this event" });
    }
    res.status(500).json({ message: "Failed to join event" });
  }
});

// GET /joined-events?email=... - requires auth + email match
router.get("/", verifyToken, verifyEmail, async (req, res) => {
  try {
    const joinedEvents = await JoinedEvent.find({ userEmail: req.decodedEmail }).sort({
      eventDate: 1,
    });
    res.status(200).json(joinedEvents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch joined events" });
  }
});

// GET /joined-events/check?eventId=...&email=... - requires auth + email match
router.get("/check", verifyToken, verifyEmail, async (req, res) => {
  try {
    const { eventId } = req.query;
    const existing = await JoinedEvent.findOne({ eventId, userEmail: req.decodedEmail });
    res.status(200).json({ joined: !!existing });
  } catch (error) {
    res.status(500).json({ message: "Failed to check join status" });
  }
});

export default router;