import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      // required: true,
    },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    dateOfBirth: String,
    contact: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    idImage: String,
    documentImage: String,
    isMemberShipListEmpty: {
      type: Boolean,
      default: true,
    },
    overdue: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Member = mongoose.model("Member", memberSchema);
