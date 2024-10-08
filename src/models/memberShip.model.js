import mongoose from "mongoose";

const memberShipSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    isMemberShipExpiry: {
      type: Boolean,
      required: true,
      default: true,
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
    actualAmount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      required: true,
    },
    txnDate: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,

      required: true,
    },
    remark: String,
  },
  { timestamps: true }
);

export const MemberShip = mongoose.model("MemberShip", memberShipSchema);
