import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Member } from "../models/member.model.js";

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

  const [day, month, year] = DOB.split("-");
  const dateOfBirth = new Date(`${month}-${day}-${year}`);

  // Check if the dateOfBirth is valid
  if (isNaN(dateOfBirth.getTime())) {
    throw new ApiError(400, "Invalid date of birth");
  }

  const member = await Member.create({
    name,
    gender,
    dateOfBirth: dateOfBirth,
    contact,
    Address,
    idImage: Image.url,
  });

  if (!member) {
    return next(new ApiError(500, "Failed to create member"));
  }

  res.status(201).json(new ApiResponse(201, "Member created", member));
});

export { createMember };
