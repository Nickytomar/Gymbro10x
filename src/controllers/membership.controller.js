import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MemberShip } from "../models/memberShip.model.js";
import { Member } from "../models/member.model.js";

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
  let newflag = false;
  const endDateObject = new Date(endDate.split("-").reverse().join("-"));
  if (Date.now() < endDateObject.getTime()) {
    newflag = true;
  }
  const newMembership = await MemberShip.create({
    member: memberId,
    name,
    contact,
    memberShip,
    flag: newflag,
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
    .json(new ApiResponse(201, newMembership, "MemberShip created"));
});

const getListOfMemberships = asyncHandler(async (req, res, next) => {
  const memberships = await MemberShip.find({});

  if (memberships.length === 0) {
    res.status(200).json(new ApiResponse(200, "List is empty", []));
  }

  memberships.forEach((membership) => {
    const endDateObject = new Date(
      membership.endDate.split("-").reverse().join("-")
    );
    if (Date.now() < endDateObject.getTime()) {
      membership.flag = true;
    }
  });

  memberships.forEach((membership) => {
    membership.save();
  });

  res
    .status(200)
    .json(new ApiResponse(200, memberships, "List of memberships"));
});

const getMemberShipById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const membership = await MemberShip.findById(id);

  if (!membership) {
    res
      .status(200)
      .json(new ApiResponse(200, "There is no membership for this user", []));
  }

  res.status(200).json(new ApiResponse(200, membership, "Membership found"));
});

const getMemberdetailsbyId = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const member = await Member.findById(id);

  if (!member) {
    return next(new ApiError(404, "Member not found"));
  }

  const memberships = await MemberShip.aggregate([
    {
      $match: {
        member: member._id,
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "member",
        foreignField: "_id",
        as: "memberDetails",
      },
    },
    {
      $unwind: "$memberDetails",
    },
    {
      $project: {
        _id: 1,
        member: 1,
        name: 1,
        contact: 1,
        memberShip: 1,
        startDate: 1,
        endDate: 1,
        payment: 1,
        txnDate: 1,
        paymentMode: 1,
        remark: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
      },
    },
  ]);

  let result;
  if (memberships.length === 0) {
    result = {
      member: member,
      memberships: [],
    };
  }
  result = {
    member,
    memberships,
  };
  res.status(200).json(new ApiResponse(200, result, "Membership found"));
});

const deleteMemberShip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const membership = await MemberShip.findByIdAndDelete(id);

  if (!membership) {
    return next(new ApiError(404, "Membership not found"));
  }

  res.status(200).json(new ApiResponse(200, membership, "Membership deleted"));
});

const updateMemberShip = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

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

  const membership = await MemberShip.findByIdAndUpdate(
    id,
    {
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
    },
    { new: true }
  );

  if (!membership) {
    return next(new ApiError(500, "Failed to update membership"));
  }

  res.status(200).json(new ApiResponse(200, membership, "Membership updated"));
});

const getListOfInactiveMemberShip = asyncHandler(async (req, res, next) => {
  const memberships = await MemberShip.find({ flag: false });

  if (memberships.length === 0) {
    res.status(200).json(new ApiResponse(200, "List is empty", []));
  }

  res
    .status(200)
    .json(new ApiResponse(200, memberships, "List of memberships"));
});

export {
  createMemberShip,
  getMemberdetailsbyId,
  getListOfMemberships,
  getMemberShipById,
  deleteMemberShip,
  updateMemberShip,
  getListOfInactiveMemberShip,
};
