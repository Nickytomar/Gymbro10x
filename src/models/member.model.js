import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
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
  },
  { timestamps: true }
);

export const Member = mongoose.model("Member", memberSchema);
