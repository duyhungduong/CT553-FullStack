import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
	try {
	  // Kiểm tra xem người dùng đã xác thực qua Clerk chưa
	  if (!req.auth || !req.auth.userId) {
		return res.status(401).json({ message: "Unauthorized - you must be logged in" });
	  }
  
	  const clerkId = req.auth.userId;
  
	  // Truy vấn model User để lấy thông tin dựa trên clerkId
	  const user = await User.findOne({ clerkId }).select("_id fullName imageUrl clerkId");
	  if (!user) {
		return res.status(404).json({ message: "User not found in database" });
	  }
  
	  // Gắn thông tin người dùng vào req.user
	  req.user = {
		_id: user._id,
		fullName: user.fullName,
		imageUrl: user.imageUrl,
		clerkId: user.clerkId,
	  };
  
	  next();
	} catch (error) {
	  console.error("Error in protectRoute middleware:", error);
	  return res.status(500).json({ message: "Internal server error" });
	}
  };

export const requireAdmin = async (req, res, next) => {
  try {
    const currentUser = await clerkClient.users.getUser(req.auth.userId);
    const isAdmin =
      process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress.emailAddress;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized - you must be an admin" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
