// user.controller.js
import { User } from "../models/user.model.js";
import { Friendship } from "../models/friendship.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllUsersExceptMe = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;
    const users = await User.find({ clerkId: { $ne: currentUserId } });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getSentPendingRequests = async (req, res, next) => {
	try {
	  const currentUserId = req.auth.userId; // Clerk ID
	  const user = await User.findOne({ clerkId: currentUserId });
  
	  const sentRequests = await Friendship.find({
		user_id1: user._id,
		status: "pending",
	  }).populate("user_id2", "fullName imageUrl clerkId");
  
	  res.status(200).json(sentRequests);
	} catch (error) {
	  next(error);
	}
  };

export const getUserById = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;
    const user = await User.findOne({ clerkId: currentUserId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Friendship related functions
export const sendFriendRequest = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;
    const { friendClerkId } = req.body;

    const sender = await User.findOne({ clerkId: currentUserId });
    const receiver = await User.findOne({ clerkId: friendClerkId });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    if (sender._id.equals(receiver._id)) {
      return res.status(400).json({ message: "Cannot add yourself as a friend" });
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { user_id1: sender._id, user_id2: receiver._id },
        { user_id1: receiver._id, user_id2: sender._id },
      ],
    });

    if (existingFriendship) {
      return res.status(400).json({ message: "Friendship request already exists" });
    }

    const friendship = new Friendship({
      user_id1: sender._id,
      user_id2: receiver._id,
      status: "pending",
    });

    await friendship.save();
    res.status(201).json({ message: "Friend request sent successfully", friendship });
  } catch (error) {
    next(error);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
	try {
	  const currentUserId = req.auth.userId; // Clerk ID
	  const { friendshipId } = req.params;
  
	  const user = await User.findOne({ clerkId: currentUserId });
	  const friendship = await Friendship.findById(friendshipId);
  
	  if (!friendship) {
		return res.status(404).json({ message: "Friendship request not found" });
	  }
  
	  if (!friendship.user_id2.equals(user._id)) {
		return res.status(403).json({ message: "You cannot accept this request" });
	  }
  
	  if (friendship.status !== "pending") {
		return res.status(400).json({ message: "Request is not pending" });
	  }
  
	  friendship.status = "accepted";
	  await friendship.save();
  
	  res.status(200).json({ message: "Friend request accepted", friendship });
	} catch (error) {
	  next(error);
	}
  };

export const getFriends = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;
    const user = await User.findOne({ clerkId: currentUserId });

    const friendships = await Friendship.find({
      $and: [
        { status: "accepted" },
        { $or: [{ user_id1: user._id }, { user_id2: user._id }] },
      ],
    }).populate([
      { path: "user_id1", select: "fullName imageUrl clerkId" },
      { path: "user_id2", select: "fullName imageUrl clerkId" },
    ]);

    const friends = friendships.map(friendship => {
      return friendship.user_id1._id.equals(user._id)
        ? friendship.user_id2
        : friendship.user_id1;
    });

    res.status(200).json(friends);
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
	try {
	  const currentUserId = req.auth.userId;
	  const user = await User.findOne({ clerkId: currentUserId });
  
	  const pendingRequests = await Friendship.find({
		user_id2: user._id,
		status: "pending",
	  }).populate("user_id1", "fullName imageUrl clerkId");
  
	  // Return the full Friendship objects instead of just senders
	  res.status(200).json(pendingRequests);
	} catch (error) {
	  next(error);
	}
  };

  // user.controller.js
export const declineFriendRequest = async (req, res, next) => {
	try {
	  const currentUserId = req.auth.userId; // Clerk ID
	  const { friendshipId } = req.params;
  
	  const user = await User.findOne({ clerkId: currentUserId });
	  const friendship = await Friendship.findById(friendshipId);
  
	  if (!friendship) {
		return res.status(404).json({ message: "Friendship request not found" });
	  }
  
	  // Only the receiver (user_id2) can decline the request
	  if (!friendship.user_id2.equals(user._id)) {
		return res.status(403).json({ message: "You cannot decline this request" });
	  }
  
	  if (friendship.status !== "pending") {
		return res.status(400).json({ message: "Request is not pending" });
	  }
  
	  // Delete the friendship request
	  await Friendship.deleteOne({ _id: friendshipId });
  
	  res.status(200).json({ message: "Friend request declined successfully" });
	} catch (error) {
	  next(error);
	}
  };