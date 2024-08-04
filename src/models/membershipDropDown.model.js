import mongoose from "mongoose";

const membershipDropDownSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    memberShipName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const membershipDropDown = mongoose.model(
  "membershipDropDown",
  membershipDropDownSchema
);
