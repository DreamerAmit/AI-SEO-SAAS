import { User } from "../models/User.js";

export const getUsedUsers = async (req, res) => {
  try {
    const usedUsers = await User.find({});
    res.status(200).json(usedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};