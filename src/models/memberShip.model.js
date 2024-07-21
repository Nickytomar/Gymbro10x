import mongoose from "mongoose";

const memberShipSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    memberShip: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    payment: {
      type: Number,
      required: true,
    },
    txnDate: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "card", "upi"],
      required: true,
    },
    remark: String,
  },
  { timestamps: true }
);

export const MemberShip = mongoose.model("MemberShip", memberShipSchema);
