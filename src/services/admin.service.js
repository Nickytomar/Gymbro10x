import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { verifyOtp } from "../services/otp.service.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createAdmin = async (adminData) => {
  const { fullName, email, password } = adminData;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const adminExists = await Admin.findOne({
    email,
  });

  if (adminExists) {
    throw new ApiError(400, "Admin already exists");
  }

  const admin = await Admin.create({
    fullName,
    email,
    password,
  });

  const createdadmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdadmin) {
    throw new ApiError(500, "Error while creating admin");
  }
  return createdadmin;
};

const loginAdmin = async (adminData) => {
  const { email, password } = adminData;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const admin = await Admin.findOne({
    email,
    password,
  });

  if (!admin) {
    throw new ApiError(400, "Invalid email or password");
  }

  if (!admin.isMailVerified) {
    throw new ApiError(400, "Email not verified");
  }
  return admin;
};

const adminService = {
  createAdmin,
  loginAdmin,
};

export default adminService;
