import mongoose from "mongoose";

const joinedEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    // Denormalized fields so we don't need to re-fetch the Event every time
    // we display the Joined Events list (faster, simpler queries)
    eventTitle: { type: String, required: true },
    eventThumbnail: { type: String, required: true },
    eventLocation: { type: String, required: true },
    eventType: { type: String, required: true },
    eventDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Prevent the same user from joining the same event twice
joinedEventSchema.index({ eventId: 1, userEmail: 1 }, { unique: true });

const JoinedEvent = mongoose.model("JoinedEvent", joinedEventSchema);

export default JoinedEvent;