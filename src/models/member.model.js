import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    dateOfBirth: Date,
    contact: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    idImage: String,
    isMemberShipEmpty: {
      type: Boolean,
      default: true,
    },
    overdue: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Member = mongoose.model("Member", memberSchema);
