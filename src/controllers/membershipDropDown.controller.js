import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { membershipDropDown } from "../models/membershipDropDown.model.js";

const createMembershipDropDown = asyncHandler(async (req, res, next) => {
  const { memberShipName, price, duration } = req.body;

  const requiredFields = [
    { name: "memberShipName", value: memberShipName },
    { name: "price", value: price },
    { name: "duration", value: duration },
  ];

  const missingField = requiredFields.find(
    (field) => field.value === undefined || field.value.trim() === ""
  );

  if (missingField) {
    return next(new ApiError(400, `${missingField.name} is required`));
  }

  const memberShip = await membershipDropDown.create({
    client: req.client._id,
    memberShipName,
    price,
    duration,
  });

  if (!memberShip) {
    return next(new ApiError(500, "Failed to create memberShip"));
  }

  res.status(201).json(new ApiResponse(201, memberShip, "MemberShip created"));
});

const getAllMembershipDropDown = asyncHandler(async (req, res, next) => {
  const memberShip = await membershipDropDown
    .find({ client: req.client._id })
    .sort({ createdAt: -1 });

  if (!memberShip) {
    return next(new ApiError(500, "Failed to get memberShip"));
  }

  res.status(200).json(new ApiResponse(200, memberShip, "MemberShip found"));
});

const getSingleMembershipDropDown = asyncHandler(async (req, res, next) => {
  const memberShip = await membershipDropDown.findById(req.params.id);

  if (!memberShip) {
    return next(new ApiError(500, "Failed to get memberShip"));
  }

  res.status(200).json(new ApiResponse(200, memberShip, "MemberShip found"));
});

const deleteMembershipDropDown = asyncHandler(async (req, res, next) => {
  const memberShip = await membershipDropDown.findByIdAndDelete(req.params.id);

  if (!memberShip) {
    return next(new ApiError(500, "Failed to delete memberShip"));
  }

  res.status(200).json(new ApiResponse(200, memberShip, "MemberShip deleted"));
});

export {
  createMembershipDropDown,
  getAllMembershipDropDown,
  getSingleMembershipDropDown,
  deleteMembershipDropDown,
};
