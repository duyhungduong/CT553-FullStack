import cloudinary from "../lib/cloudinary.js";
import { Sticker } from "../models/sticker.model.js";
import { StickerPack } from "../models/stickerPack.model.js";
import { StickerPackItem } from "../models/stickerPackItem.model.js";
import { UserStickerPack } from "../models/userStickerPack.model.js";
import sharp from "sharp";

// Hàm tách nền đen
const removeBlackBackground = async (filePath) => {
  try {
    // console.log("Removing black background for file:", filePath);
    const image = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = image;
    // console.log("Image info:", info);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r < 50 && g < 50 && b < 50) {
        data[i + 3] = 0;
      }
    }

    const processedImage = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png({ quality: 80 })
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error(
      "Error in removeBlackBackground:",
      error.message,
      error.stack
    );
    throw new Error("Failed to remove black background: " + error.message);
  }
};

// Hàm upload lên Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    // console.log("Checking file mimetype:", file.mimetype);
    if (!["image/png", "image/jpeg", "image/gif"].includes(file.mimetype)) {
      throw new Error("Only PNG, JPEG, and GIF images are allowed");
    }

    // Tách nền đen
    const processedImageBuffer = await removeBlackBackground(file.tempFilePath);

    // Upload ảnh đã xử lý lên Cloudinary trực tiếp từ buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          chunk_size: 20000000,
          timeout: 180000,
          format: "png",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error.message);
            return reject(
              new Error("Cloudinary upload error: " + error.message)
            );
          }
          if (!result || !result.secure_url) {
            console.error("Cloudinary upload failed: No secure URL returned");
            return reject(new Error("Upload failed. No secure URL returned."));
          }
          resolve(result);
        }
      );
      stream.end(processedImageBuffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error in uploadToCloudinary:", error.message, error.stack);
    throw error;
  }
};

const VALID_CATEGORIES = [
  "Emotions",
  "Animals",
  "Cartoon",
  "Music",
  "Food",
  "Travel",
  "Sports",
  "Funny",
  "Festivals",
  "Love",
  "Game",
  "Weather",
  "Tech",
  "Art",
  "Others",
];

// Create sticker
export const createSticker = async (req, res) => {
  try {
    const { name, category, is_premium } = req.body;

    // console.log("Creating sticker with data:", { name, category, is_premium }); // Log dữ liệu đầu vào

    // Kiểm tra dữ liệu đầu vào
    if (!name || name.trim().length < 1 || name.length > 50) {
      return res
        .status(400)
        .json({ error: "Name is required and must be 1-50 characters" });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Sticker image is required" });
    }

    // Upload ảnh
    const imageFile = req.files.image;
    // console.log("Uploading image file:", imageFile); // Log thông tin file
    const image_url = await uploadToCloudinary(imageFile);

    const sticker = new Sticker({
      name: name.trim(),
      image_url,
      category,
      is_premium: is_premium === "true" || false,
    });

    await sticker.save();
    res.status(201).json({
      message: "Sticker created successfully",
      sticker,
    });
  } catch (error) {
    console.error("Error in createSticker:", error.message, error.stack); // Log chi tiết lỗi
    res.status(500).json({ error: error.message });
  }
};

// Update sticker
export const updateSticker = async (req, res) => {
  try {
    const { name, category, is_premium } = req.body;
    const updateData = {};

    if (name) {
      if (name.trim().length < 1 || name.length > 50) {
        return res.status(400).json({ error: "Name must be 1-50 characters" });
      }
      updateData.name = name.trim();
    }
    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }
      updateData.category = category;
    }
    if (is_premium !== undefined) updateData.is_premium = is_premium === "true";

    // Nếu có file mới, upload và xóa ảnh cũ
    if (req.files && req.files.image) {
      const sticker = await Sticker.findById(req.params.id);
      if (!sticker) {
        return res.status(404).json({ error: "Sticker not found" });
      }
      const imageFile = req.files.image;
      updateData.image_url = await uploadToCloudinary(imageFile);
      // Xóa ảnh cũ trên Cloudinary
      const oldPublicId = sticker.image_url.split("/").pop().split(".")[0];
      await cloudinary.uploader
        .destroy(oldPublicId)
        .catch((err) => console.error("Failed to delete old image:", err));
    }

    const sticker = await Sticker.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!sticker) {
      return res.status(404).json({ error: "Sticker not found" });
    }

    res.status(200).json({
      message: "Sticker updated successfully",
      sticker,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllStickers = async (req, res) => {
  try {
    const { category, is_premium, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (is_premium !== undefined) query.is_premium = is_premium === "true";

    const total = await Sticker.countDocuments(query);
    const stickers = await Sticker.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      stickers,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStickerById = async (req, res) => {
  try {
    const sticker = await Sticker.findById(req.params.id);
    if (!sticker) {
      return res.status(404).json({ error: "Sticker not found" });
    }
    res.status(200).json(sticker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSticker = async (req, res) => {
  try {
    const sticker = await Sticker.findById(req.params.id);
    if (!sticker) {
      return res.status(404).json({ error: "Sticker not found" });
    }

    // Kiểm tra xem sticker có trong pack nào không
    const packItems = await StickerPackItem.find({ sticker: req.params.id });
    if (packItems.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete sticker in use by a pack" });
    }

    // Xóa ảnh trên Cloudinary
    const publicId = sticker.image_url.split("/").pop().split(".")[0];
    await cloudinary.uploader
      .destroy(publicId)
      .catch((err) => console.error("Failed to delete image:", err));

    await sticker.deleteOne();
    res.status(200).json({ message: "Sticker deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const createStickerPack = async (req, res) => {
  try {
    const { name, description, is_premium, price, stickerIds } = req.body;

    const stickerPack = new StickerPack({
      name,
      description,
      is_premium: is_premium || false,
      price: price || 0,
    });

    await stickerPack.save();

    if (stickerIds && Array.isArray(stickerIds)) {
      const packItems = stickerIds.map((stickerId) => ({
        pack: stickerPack._id,
        sticker: stickerId,
      }));
      await StickerPackItem.insertMany(packItems);
    }

    res.status(201).json({
      message: "Sticker pack created successfully",
      stickerPack,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStickerPacksWithStickers = async (packs) => {
  const packIds = packs.map((p) => p._id);
  const stickerPackItems = await StickerPackItem.find({
    pack: { $in: packIds },
  })
    .populate(
      "sticker",
      "_id name image_url category is_premium createdAt updatedAt"
    )
    .lean();

  const packItemsMap = stickerPackItems.reduce((map, item) => {
    const packId = item.pack.toString();
    map[packId] = map[packId] || [];
    map[packId].push(item.sticker);
    return map;
  }, {});

  return packs.map((pack) => ({
    _id: pack._id.toString(),
    name: pack.name,
    description: pack.description,
    is_premium: pack.is_premium,
    price: pack.price,
    stickers: packItemsMap[pack._id.toString()] || [],
    createdAt: pack.createdAt,
    updatedAt: pack.updatedAt,
  }));
};

// API getAllStickerPacks
export const getAllStickerPacks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query, mặc định là 1 và 10
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Tính tổng số sticker packs
    const total = await StickerPack.countDocuments();

    // Lấy danh sách sticker packs với phân trang
    const stickerPacks = await StickerPack.find()
      .skip((pageNum - 1) * limitNum) // Bỏ qua số lượng bản ghi tương ứng với các trang trước
      .limit(limitNum) // Giới hạn số lượng bản ghi
      .lean();

    // Lấy thông tin stickers cho các pack
    const stickerPacksWithStickers = await getStickerPacksWithStickers(
      stickerPacks
    );

    // Trả về dữ liệu với cấu trúc mà frontend mong đợi
    res.status(200).json({
      stickerPacks: stickerPacksWithStickers,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const purchaseStickerPack = async (req, res) => {
  try {
    const { userId, packId } = req.body;

    const stickerPack = await StickerPack.findById(packId);
    if (!stickerPack) {
      return res.status(404).json({ error: "Sticker pack not found" });
    }

    const existingPurchase = await UserStickerPack.findOne({
      user: userId,
      pack: packId,
    });
    if (existingPurchase) {
      return res.status(400).json({ error: "User already owns this pack" });
    }

    const purchase = new UserStickerPack({
      user: userId,
      pack: packId,
    });

    await purchase.save();
    res.status(201).json({
      message: "Sticker pack purchased successfully",
      purchase,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserStickerPacks = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Kiểm tra userId có hợp lệ không
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // Đếm tổng số UserStickerPack của user để tính phân trang
    const total = await UserStickerPack.countDocuments({ user: userId });

    // Lấy UserStickerPack của user với phân trang và populate thông tin user và pack
    const userPacks = await UserStickerPack.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select:
          "_id clerkId fullName imageUrl joined_date is_premium last_login createdAt updatedAt",
      })
      .populate({
        path: "pack",
        select: "_id name description is_premium price createdAt updatedAt",
      })
      .lean();

    if (!userPacks.length) {
      return res.status(200).json({
        userStickerPacks: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      });
    }

    // Lấy tất cả pack IDs từ userPacks
    const packIds = userPacks.map((userPack) => userPack.pack._id);

    // Lấy StickerPackItem liên quan đến các pack này và populate sticker
    const stickerPackItems = await StickerPackItem.find({
      pack: { $in: packIds },
    })
      .populate({
        path: "sticker",
        select: "_id name image_url category is_premium createdAt updatedAt",
      })
      .lean();

    // Tạo một map để nhóm stickers theo pack
    const packItemsMap = stickerPackItems.reduce((map, item) => {
      const packId = item.pack.toString();
      if (!map[packId]) {
        map[packId] = [];
      }
      // Thêm packId vào sticker
      const stickerWithPackId = {
        ...item.sticker,
        packId: packId,
      };
      map[packId].push(stickerWithPackId);
      return map;
    }, {});

    // Định dạng dữ liệu trả về
    const result = userPacks.map((userPack) => {
      const pack = userPack.pack;
      const packId = pack._id.toString();

      return {
        _id: userPack._id.toString(),
        user: userPack.user, // Đã populate thành object User
        pack: {
          _id: packId,
          name: pack.name,
          description: pack.description,
          is_premium: pack.is_premium,
          price: pack.price,
          stickers: packItemsMap[packId] || [],
          createdAt: pack.createdAt,
          updatedAt: pack.updatedAt,
          isOwned: true,
        },
        purchased_at: userPack.purchased_at,
        createdAt: userPack.createdAt,
        updatedAt: userPack.updatedAt,
      };
    });

    res.status(200).json({
      userStickerPacks: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getUserStickerPacks:", error);
    res.status(500).json({ error: error.message });
  }
};
