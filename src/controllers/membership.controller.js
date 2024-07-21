import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MemberShip } from "../models/memberShip.model.js";

const createMemberShip = asyncHandler(async (req, res, next) => {
  const {
    memberId,
    name,
    contact,
    memberShip,
    startDate,
    endDate,
    payment,
    txnDate,
    paymentMode,
    remark,
  } = req.body;

  const requiredFields = [
    { name: "memberId", value: memberId },
    { name: "name", value: name },
    { name: "contact", value: contact },
    { name: "memberShip", value: memberShip },
    { name: "startDate", value: startDate },
    { name: "endDate", value: endDate },
    { name: "payment", value: payment },
    { name: "txnDate", value: txnDate },
    { name: "paymentMode", value: paymentMode },
  ];

  const missingField = requiredFields.find(
    (field) => field.value === undefined || field.value.trim() === ""
  );

  if (missingField) {
    return next(new ApiError(400, `${missingField.name} is required`));
  }

  const newMembership = await MemberShip.create({
    member: memberId,
    name,
    contact,
    memberShip,
    startDate,
    endDate,
    payment,
    txnDate,
    paymentMode,
    remark,
  });

  if (!newMembership) {
    return next(new ApiError(500, "Failed to create memberShip"));
  }

  res
    .status(201)
    .json(new ApiResponse(201, "MemberShip created", newMembership));
});

const getListOfMemberships = asyncHandler(async (req, res, next) => {
  const memberships = await MemberShip.find({});

  res
    .status(200)
    .json(new ApiResponse(200, "List of memberships", memberships));
});

const getMemberShipById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const membership = await MemberShip.findById(id);

  if (!membership) {
    return next(new ApiError(404, "Membership not found"));
  }

  res.status(200).json(new ApiResponse(200, "Membership found", membership));
});

export { createMemberShip, getListOfMemberships, getMemberShipById };
