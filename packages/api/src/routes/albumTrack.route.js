import { Router } from "express";
import { getAllAlbumTrack } from "../controller/albumTrack.controller.js";

const router = Router();

router.get("/", getAllAlbumTrack)

export default router;