import { Router } from "express";
import { getAlbumById, getAllAlbums, getRelatedAlbums } from "../controller/album.controller.js";

const router = Router()

router.get("/", getAllAlbums);
router.get("/:albumId", getAlbumById);
router.get("/:albumId/related", getRelatedAlbums)

export default router