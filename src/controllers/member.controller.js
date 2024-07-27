import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Member } from "../models/member.model.js";
import { MemberShip } from "../models/membership.model.js";
import { cloudinary } from "../utils/cloudinary.js";

import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createMember = asyncHandler(async (req, res, next) => {
  const { name, gender, DOB, contact, Address, idImage } = req.body;

  const requiredFields = [
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

  const buffer = Buffer.from(idImage, "base64");
  const tempFilePath = path.join(__dirname, "temp_image.jpg");
  fs.writeFileSync(tempFilePath, buffer);

  const Image = await uploadOnCloudinary(tempFilePath);

  const member = await Member.create({
    clientId: req.client._id,
    name,
    gender,
    dateOfBirth: DOB,
    contact,
    Address,
    idImage: Image.url,
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
  const member = await Member.findById(req.params.id);

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
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, members, "List of inactive members"));
});

const deleteMemberById = asyncHandler(async (req, res, next) => {
  const member = await Member.findByIdAndDelete(req.params.id);
  if (!member) {
    return next(new ApiError(404, "member not found"));
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

export {
  createMember,
  getListOfMembers,
  getMemberById,
  getListOfInactiveMembers,
  deleteMemberById,
  getListOfMembersbyClientId,
};
