const bcrypt = require("bcryptjs");
const User = require("../model/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

// POST /auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, adminKey } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "name, email and password are required");
  }
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "Email already registered");

  // Admin role can only be granted with the secret key
  let finalRole = "user";
  if (role === "admin") {
    if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) {
      throw new ApiError(403, "Invalid admin key");
    }
    finalRole = "admin";
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: finalRole });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const u = req.user;
  res.json({ success: true, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
});
