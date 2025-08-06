import { Router } from "express";
import {
  createSticker,
  createStickerPack,
  deleteSticker,
  getAllStickerPacks,
  getAllStickers,
  getStickerById,
  getUserStickerPacks,
  purchaseStickerPack,
  updateSticker,
} from "../controller/sticker.controller.js";

const router = Router();

router.post("/stickers", createSticker); // Bỏ multer
router.get("/stickers", getAllStickers);
router.get("/stickers/:id", getStickerById);
router.put("/stickers/:id", updateSticker); // Bỏ multer
router.delete("/stickers/:id", deleteSticker);

router.post("/sticker-packs", createStickerPack);
router.get("/sticker-packs", getAllStickerPacks);
router.post("/sticker-packs/purchase", purchaseStickerPack);
router.get("/user/:userId/sticker-packs", getUserStickerPacks);

export default router;