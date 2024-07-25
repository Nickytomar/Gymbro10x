import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema(
  {
    montlyCollection: {
      require: true,
      type: Number,
    },
    weeklyCollection: {
      require: true,
      type: Number,
    },
    totalCollection: {
      require: true,
      type: Number,
    },
  },
  { timestamps: true }
);

export const Dashboard = mongoose.model("Dashboard", dashboardSchema);
