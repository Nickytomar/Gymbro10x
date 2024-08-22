import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Member } from "../models/member.model.js";
import { Client } from "../models/client.model.js";
import { MemberShip } from "../models/memberShip.model.js";
import { cloudinary } from "../utils/cloudinary.js";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cookieOptions = {
  // making the cookie not modifiable by client only sever can modify it
  httpOnly: true, // Make cookies accessible only via HTTP(S)
  secure: true, // Ensure cookies are only sent over HTTPS
};

const generatorAccessAndRefreshTokenForClient = async (clientId) => {
  try {
    const member = await Member.findById(clientId);
    if (!member) {
      throw new Error("member not found");
    }

    const accessToken = member.generateAccessToken();
    const refreshToken = member.generateRefreshToken();

    member.refreshToken = refreshToken;
    await member.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh tokens"
    );
  }
};

const createMember = asyncHandler(async (req, res, next) => {
  const {
    clientEmail,
    name,
    gender,
    DOB,
    contact,
    Address,
    idImage,
    documentImage,
  } = req.body;

  const requiredFields = [
    { name: "clientEmail", value: clientEmail },
    { name: "name", value: name },
    { name: "gender", value: gender },
    { name: "DOB", value: DOB },
    { name: "contact", value: contact },
    { name: "Address", value: Address },
  ];

  const missingField = requiredFields.find(
    (field) => field.value === undefined || field.value.trim() === ""
  );

  if (missingField) {
    return next(new ApiError(400, `${missingField.name} is required`));
  }
  if (!emailRegex.test(clientEmail)) {
    return next(new ApiError(400, "Invalid email"));
  }

  const client = await Client.findOne({ email: clientEmail });
  if (!client) {
    return next(
      new ApiError(404, {}, `client with email : ${clientEmail} not found`)
    );
  }

  let Image = "";
  if (idImage && idImage !== "") {
    const buffer = Buffer.from(idImage, "base64");
    const tempFilePath = path.join(__dirname, "temp_image.jpg");
    fs.writeFileSync(tempFilePath, buffer);
    Image = await uploadOnCloudinary(tempFilePath);
  }

  let doc = "";
  if (documentImage && documentImage !== "") {
    const buffer1 = Buffer.from(documentImage, "base64");
    const tempFilePath1 = path.join(__dirname, "temp_doc.jpg");
    fs.writeFileSync(tempFilePath1, buffer1);
    doc = await uploadOnCloudinary(tempFilePath1);
  }

  const member = await Member.create({
    clientId: client._id,
    clientEmail: clientEmail,
    name,
    gender,
    dateOfBirth: DOB,
    contact,
    Address,
    idImage: Image && Image.url ? Image.url : "",
    documentImage: doc && doc.url ? doc.url : "",
    flag: true,
  });

  if (!member) {
    return next(new ApiError(500, "Failed to create member"));
  }

  res.status(201).json(new ApiResponse(201, member, "Member created"));
});

const getListOfMembers = asyncHandler(async (req, res, next) => {
  const members = await Member.find({}).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, members, "List of members"));
});

const getListOfMembersbyClientId = asyncHandler(async (req, res, next) => {
  const members = await Member.find({ clientId: req.client._id }).sort({
    createdAt: -1,
  });

  res.status(200).json(new ApiResponse(200, members, "List of members"));
});

const getMemberById = asyncHandler(async (req, res, next) => {
  const member = await Member.findById(req.params.id).select("-documentImage");

  if (!member) {
    return next(new ApiError(404, "Member not found"));
  }

  res.status(200).json(new ApiResponse(200, member, "Member"));
});

const getListOfInactiveMembers = asyncHandler(async (req, res, next) => {
  const members = await Member.aggregate([
    {
      $lookup: {
        from: "memberships",
        localField: "_id",
        foreignField: "member",
        as: "membership",
      },
    },
    {
      $match: {
        membership: { $size: 0 },
      },
    },
  ]).select("-documentImage");

  res
    .status(200)
    .json(new ApiResponse(200, members, "List of inactive members"));
});

const deleteMemberById = asyncHandler(async (req, res, next) => {
  const member = await Member.findByIdAndDelete(req.params.id);
  if (!member) {
    return next(new ApiError(404, "member not found"));
  }

  if (!req.client || !req.client._id) {
    return next(new ApiError(403, "Client information not available"));
  }

  if (member.clientId.toString() !== req.client._id.toString()) {
    return next(new ApiError(403, "You are not allowed to delete this member"));
  }

  const publicId = member.idImage.split("/").pop().split(".")[0];
  await cloudinary.uploader.destroy(publicId);

  const memberships = await MemberShip.find({ member: req.params.id });

  if (memberships.length > 0) {
    await MemberShip.deleteMany({ member: req.params.id });
  }

  res.status(200).json(new ApiResponse(200, member, "Member deleted"));
});

const loginMember = asyncHandler(async (req, res, next) => {
  const { clientEmail, contact } = req.body;

  const client = await Client.findOne({ email: clientEmail });
  if (!client) {
    return next(new ApiError(404, "Client not found"));
  }
  const member = await Member.findOne({ contact });
  if (!member) {
    return next(new ApiError(404, "Member not found"));
  }

  const { accessToken, refreshToken } =
    await generatorAccessAndRefreshTokenForClient(member._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { id: member._id }, "you are login"));
});
const updateMember = asyncHandler(async (req, res, next) => {
  const {
    clientEmail,
    name,
    gender,
    DOB,
    contact,
    Address,
    idImage,
    documentImage,
  } = req.body;
  const member = await Member.findById(req.params.id);
  if (!member) {
    return next(new ApiError(404, "Member not found"));
  }

  let Image = "";
  if (idImage && idImage !== "") {
    const buffer = Buffer.from(idImage, "base64");
    const tempFilePath = path.join(__dirname, "temp_image.jpg");
    fs.writeFileSync(tempFilePath, buffer);
    Image = await uploadOnCloudinary(tempFilePath);
  }

  let doc = "";
  if (documentImage && documentImage !== "") {
    const buffer1 = Buffer.from(documentImage, "base64");
    const tempFilePath1 = path.join(__dirname, "temp_doc.jpg");
    fs.writeFileSync(tempFilePath1, buffer1);
    doc = await uploadOnCloudinary(tempFilePath1);
  }

  const updatedMember = await Member.findByIdAndUpdate(
    req.params.id,
    {
      clientEmail,
      name,
      gender,
      DOB,
      contact,
      Address,
      idImage: Image && Image.url ? Image.url : member.idImage,
      documentImage: doc && doc.url ? doc.url : member.documentImage,
    },
    { new: true }
  );
  if (!updatedMember) {
    return next(new ApiError(500, "Failed to update member"));
  }
  res.status(200).json(new ApiResponse(200, updatedMember, "Member updated"));
});

export {
  createMember,
  getListOfMembers,
  getMemberById,
  getListOfInactiveMembers,
  deleteMemberById,
  getListOfMembersbyClientId,
  loginMember,
  updateMember,
};
