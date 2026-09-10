import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// GET /events - fetch all upcoming events (future dates only), or events by creator
router.get("/", async (req, res) => {
  try {
    const { type, search, email } = req.query;

    // If "email" is provided, this is a "Manage Events" request —
    // return ALL events created by this user, past or future.
    if (email) {
      const myEvents = await Event.find({ creatorEmail: email }).sort({
        eventDate: 1,
      });
      return res.status(200).json(myEvents);
    }

    // Otherwise, this is the public "Upcoming Events" request
    const query = {
      eventDate: { $gte: new Date() },
    };

    if (type && type !== "all") {
      query.eventType = type;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const events = await Event.find(query).sort({ eventDate: 1 });
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

// PUT /events/:id - update an event (only by its creator)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { requesterEmail, ...updateData } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ownership check: users can only update their OWN created events
    if (event.creatorEmail !== requesterEmail) {
      return res.status(403).json({ message: "You can only update your own events" });
    }

    const updated = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE /events/:id?email=... - delete an event (only by its creator)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.creatorEmail !== email) {
      return res.status(403).json({ message: "You can only delete your own events" });
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;