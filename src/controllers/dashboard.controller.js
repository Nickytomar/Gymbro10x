import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
<<<<<<< HEAD
import { MemberShip } from "../models/memberShip.model.js";
=======
import { MemberShip } from "../models/membership.model.js";
import { Member } from "../models/member.model.js";
>>>>>>> 8cc9d05 (refactor: Update dashboard controller to calculate additional metrics)

const dashboard = asyncHandler(async (req, res, next) => {
  const members = await Member.find({ clientId: req.client._id });
  const memberShips = await MemberShip.find({});

  const memberShipList = members.map((member) => {
    return memberShips.filter((memberShip) =>
      memberShip.member.equals(member._id)
    );
  });

  const flattenedMemberShipList = memberShipList.flat();

  let currentDate = new Date();
  const monthlyDate = new Date(currentDate);
  monthlyDate.setMonth(currentDate.getMonth() - 1);
  const weeklyDate = new Date(currentDate);
  weeklyDate.setDate(currentDate.getDate() - 7);

  let monthlyAmount = 0;
  let weeklyAmount = 0;
  let totalMontlyAmount = 0;
  let activeMembersCount = 0;
  let inactiveMembersCount = 0;
  let newMembersCount = 0;
  let expiredMembershipsCount = 0;

  const newMembersDate = new Date(currentDate);
  newMembersDate.setDate(currentDate.getDate() - 30); // Example: new members in the last 30 days
  const upcomingExpirationDate = new Date(currentDate);
  upcomingExpirationDate.setDate(currentDate.getDate() + 30); // Example: memberships expiring in the next 30 days

  members.forEach((member) => {
    if (!member.overdue) {
      activeMembersCount++;
    } else {
      inactiveMembersCount++;
    }

    const createdAtDate = new Date(member.createdAt);
    if (createdAtDate > newMembersDate) {
      newMembersCount++;
    }
  });

  flattenedMemberShipList.forEach((memberShip) => {
    const startDateObject = new Date(
      memberShip.startDate.split("-").reverse().join("-")
    );
    const endDateObject = new Date(
      memberShip.endDate.split("-").reverse().join("-")
    );

    if (startDateObject > monthlyDate) {
      monthlyAmount += memberShip.paidAmount;
    }
    if (startDateObject > weeklyDate) {
      weeklyAmount += memberShip.paidAmount;
    }
    totalMontlyAmount += memberShip.paidAmount;

    if (endDateObject < currentDate) {
      expiredMembershipsCount++;
    }
  });

  const newdashboard = {
    monthlyCollection: monthlyAmount,
    weeklyCollection: weeklyAmount,
    totalCollection: totalMontlyAmount,
    activeMembers: activeMembersCount,
    inactiveMembers: inactiveMembersCount,
    newMembers: newMembersCount,
    expiredMemberships: expiredMembershipsCount,
  };

  res.status(200).json(new ApiResponse(200, newdashboard, "dashboard info"));
});

export { dashboard };
