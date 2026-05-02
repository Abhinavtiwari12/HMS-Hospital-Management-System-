import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  }
}, { timestamps: true });

export const Appointment = mongoose.model("Appointment", appointmentSchema);