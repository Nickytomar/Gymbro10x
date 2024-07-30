import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Client } from "../models/client.model.js";
import { Member } from "../models/member.model.js";
import { MemberShip } from "../models/memberShip.model.js";
import { sendEmail } from "../services/mail.service.js";
import { isValidObjectId } from "mongoose";
import { generateOtp, verifyOtp } from "../services/otp.service.js";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Options for setting cookies
const cookieOptions = {
  // making the cookie not modifiable by client only sever can modify it
  httpOnly: true, // Make cookies accessible only via HTTP(S)
  secure: true, // Ensure cookies are only sent over HTTPS
};

const generatorAccessAndRefreshTokenForClient = async (clientId) => {
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error("Property not found");
    }

    const accessToken = client.generateAccessToken();
    const refreshToken = client.generateRefreshToken();

    client.refreshToken = refreshToken;
    await client.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh tokens"
    );
  }
};

const registerClient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const ClientExists = await Client.findOne({
    email,
  });

  if (ClientExists) {
    throw new ApiError(400, "Admin already exists");
  }
  const client = await Client.create({
    email,
    password,
  });

  if (!client) {
    throw new ApiError(500, "Error while creating admin");
  }

  const createdClient = await Client.findById(client._id).select(
    "-password -refreshToken"
  );

  if (!createdClient) {
    throw new ApiError(500, "Error while creating admin");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdClient, "Login created successfully"));
});

const loginClient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const client = await Client.findOne({
    email,
  });

  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  if (client.password !== password) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } =
    await generatorAccessAndRefreshTokenForClient(client._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "you are login"));
});

const logoutClient = asyncHandler(async (req, res) => {
  await Client.findByIdAndUpdate(
    req.client._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "client logged out"));
});

const getListOfClient = asyncHandler(async (req, res) => {
  const client = await Client.find({})
    .sort({ createdAt: -1 })
    .select("-refreshToken");

  if (client.length == 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "clients list is empty"));
  }

  const result = {
    client,
    noOfClient: client.length,
  };
  res.status(200).json(new ApiResponse(200, result, "list of clients"));
});

const deleteClient = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Client id is required");
  }
  const client = await Client.findById(req.params.id);
  if (!client) {
    throw new ApiError(404, "Client not found");
  }
  const members = await Member.find({ clientId: req.params.id });
  members.forEach(async (member) => {
    await MemberShip.deleteMany({ member: member._id });
    await Member.findByIdAndDelete(member._id);
  });
  await Client.findByIdAndDelete(req.params.id);

  if (!client) {
    s;
    throw new ApiError(404, "Client not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Client deleted successfully"));
});

const sendOtptoMail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log("email", email);
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const otp = generateOtp();

  if (!otp) {
    throw new ApiError(500, "error while sending otp");
  }

  const data = {
    otp,
    validity: "10 minutes",
    companyName: "Gymbro10x",
  };

  const mail = await sendEmail(
    email,
    "OTP for Email Verification",
    "otp_email_template",
    data
  );

  if (!mail) {
    throw new ApiError(500, "error while sending otp");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, mail, ` ${otp} otp sent successfully`));
});

const changePassword = asyncHandler(async (req, res) => {
  const { email, otp, password, comfirmPassword } = req.body;

  if (!email || !otp || !password || !comfirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!verifyOtp(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (password !== comfirmPassword) {
    throw new ApiError(400, "Password and confirm password does not match");
  }

  let client = await Client.findOne({ email });

  if (!client) {
    throw new ApiError(400, "Invalid email");
  }

  client.password = password;
  await client.save();

  client = await Client.findOne({ email }).select(" -refreshToken");

  res.status(200).json({
    status_code: 200,
    message: "Password changed successfully",
    data: client,
  });
});

export {
  registerClient,
  loginClient,
  logoutClient,
  getListOfClient,
  deleteClient,
  sendOtptoMail,
  changePassword,
};
