import User from "../models/User.js";
import Resume from "../models/Resume.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// controller for user registration
// POST: /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // check existing user
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // token
    const token = generateToken(newUser._id);

    newUser.password = undefined;

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: newUser,
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// controller for user login
// POST: /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    user.password = undefined;

    return res.status(200).json({
      message: "Login successfully",
      token,
      user,
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// controller for getting user by id
// GET: /api/users/data
export const getUserById = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.password = undefined;

    return res.status(200).json({
      user,
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// controller for getting user resumes
// GET: /api/users/resumes
export const getUserResume = async (req, res) => {
  try {
    const userId = req.userId;

    const resumes = await Resume.find({ userId });

    return res.status(200).json({
      resumes,
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};