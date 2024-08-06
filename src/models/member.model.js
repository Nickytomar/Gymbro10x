import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const memberSchema = new mongoose.Schema(
  {
    // clientId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Client",
    //   // required: true,
    // },
    clientEmail: {
      type: String,
      required: true,
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
    flag: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

memberSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      contact: this.contact,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

memberSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Member = mongoose.model("Member", memberSchema);
