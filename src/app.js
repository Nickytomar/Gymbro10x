import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { ApiError } from "./utils/ApiError.js";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));
// app.use(bodyParser.json());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

//routes import

import healthcheckRouter from "./routes/healthcheck.routes.js";
import client from "./routes/client.routes.js";
import member from "./routes/member.routes.js";
import membership from "./routes/memberShip.routes.js";
import dashboard from "./routes/dashboard.routes.js";
import membershipDropDown from "./routes/membershipDropDown.routes.js";

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/client", client);
app.use("/api/v1/member", member);
app.use("/api/v1/membership", membership);
app.use("/api/v1/dashboard", dashboard);
app.use("/api/v1/membershipDropDown", membershipDropDown);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      title: "Error",
      exception: err.message,
    });
  } else {
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      title: "Error",
      exception: err.message,
    });
  }
});

// http://localhost:8000/api/v1/users/register

export { app };
