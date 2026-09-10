import express from "express";
import Event from "../models/Event.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyEmail from "../middlewares/verifyEmail.js";

const router = express.Router();

// GET /events - public upcoming events, OR private "my events" if ?email= is present
router.get("/", async (req, res, next) => {
  const { email } = req.query;
  if (email) {
    // Protect this branch only — creator's own events require auth
    return verifyToken(req, res, () => verifyEmail(req, res, () => getMyEvents(req, res)));
  }
  return getPublicEvents(req, res);
});

const getPublicEvents = async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = { eventDate: { $gte: new Date() } };
    if (type && type !== "all") query.eventType = type;
    if (search) query.title = { $regex: search, $options: "i" };
    const events = await Event.find(query).sort({ eventDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const myEvents = await Event.find({ creatorEmail: req.decodedEmail }).sort({
      eventDate: 1,
    });
    res.status(200).json(myEvents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your events" });
  }
};

// GET /events/:id - public, no auth needed
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// POST /events - requires auth
router.post("/", verifyToken, async (req, res) => {
  try {
    const eventData = { ...req.body, creatorEmail: req.decodedEmail };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(eventData.eventDate) < today) {
      return res.status(400).json({ message: "Event date must be in the future" });
    }

    const result = await Event.create(eventData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

// PUT /events/:id - requires auth + ownership
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.creatorEmail !== req.decodedEmail) {
      return res.status(403).json({ message: "You can only update your own events" });
    }

    const { requesterEmail, ...updateData } = req.body;
    const updated = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE /events/:id - requires auth + ownership
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.creatorEmail !== req.decodedEmail) {
      return res.status(403).json({ message: "You can only delete your own events" });
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;