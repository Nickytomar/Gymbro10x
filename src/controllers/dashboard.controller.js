import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MemberShip } from "../models/memberShip.model.js";
import { Member } from "../models/member.model.js";

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

  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const year = String(currentDate.getFullYear());
  let currentFormatedDate = `${day}-${month}-${year};`; //'DD-MM-YYYY'
  const monthlyDate = new Date(currentDate);
  monthlyDate.setMonth(currentDate.getMonth() - 1);
  const weeklyDate = new Date(currentDate);
  weeklyDate.setDate(currentDate.getDate() - 7);

  let monthlyAmount = 0;
  let weeklyAmount = 0;
  let todayCollectionAmount = 0;
  let totalMontlyAmount = 0;
  let activeMembersCount = 0;
  let inactiveMembersCount = 0;
  let noMembershipCount = 0;

  const newMembersDate = new Date(currentDate);
  newMembersDate.setDate(currentDate.getDate() - 30); // Example: new members in the last 30 days
  const upcomingExpirationDate = new Date(currentDate);
  upcomingExpirationDate.setDate(currentDate.getDate() + 30); // Example: memberships expiring in the next 30 days

  members.forEach((member) => {
    if (!member.overdue && !member.isMemberShipListEmpty) {
      activeMembersCount++;
    } else {
      if (!member.isMemberShipListEmpty) {
        inactiveMembersCount++;
      } else {
        noMembershipCount++;
      }
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

    if (memberShip.startDate == currentFormatedDate) {
      todayCollectionAmount += memberShip.paidAmount;
    }
  });

  const newdashboard = {
    monthlyCollection: monthlyAmount,
    weeklyCollection: weeklyAmount,
    totalCollection: totalMontlyAmount,
    todayCollectionAmount: todayCollectionAmount,
    activeMembers: activeMembersCount,
    inactiveMembers: inactiveMembersCount,
    noMembership: noMembershipCount,
  };
  console.log(newdashboard);

  res.status(200).json(new ApiResponse(200, newdashboard, "dashboard info"));
});

export { dashboard };
