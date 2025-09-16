const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const crypto = require("crypto");
const transporter = require("../config/mailer");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error("User already exists");
      error.statusCode = 400;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    res.status(200).json({
      _id: user.id,
      name: user.name, 
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

const makeResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashed };
};

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const err = new Error("Email is required");
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findOne({ email });
    // Always send a generic response to avoid user enumeration
    if (!user) {
      return res.json({
        message:
          "If that email is registered, a password reset link has been created.",
      });
    }

    const { token, hashed } = makeResetToken();

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const clientBase = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientBase}/reset-password?token=${token}`;

    // ✉️ Send email with Nodemailer
    await transporter.sendMail({
      from: `"Activity App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>You requested to reset your password. Click below to set a new one:</p>
        <a href="${resetUrl}" style="color: #1e90ff;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.json({
      message:
        "If that email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      const err = new Error("Token and new password are required");
      err.statusCode = 400;
      return next(err);
    }
    if (password.length < 6) {
      const err = new Error("Password must be at least 6 characters");
      err.statusCode = 400;
      return next(err);
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const err = new Error("Invalid or expired token");
      err.statusCode = 400;
      return next(err);
    }

    // Set new password and clear reset fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({ message: "Password updated successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,    
  resetPassword,    
};


