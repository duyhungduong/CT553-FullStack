import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
  try {
    const { id, firstName, lastName, imageUrl } = req.body;

    // check if user already exists
    const user = await User.findOne({ clerkId: id });

    if (!user) {
      // signup
      await User.create({
        clerkId: id,
        fullName: `${firstName || ""} ${lastName || ""}`.trim(),
        imageUrl,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Login successfully!", error: false });
  } catch (err) {
    console.log("Error in auth callback", err);
    res.json({
      message: err.message || "Internal Message Error" || err,
      error: true,
      success: false,
    });
    next(err);
  }
};
