import { Router } from "express";
import { getAllTrackArtist } from "../controller/trackArtist.controller.js";

const router = Router();

router.get("/", getAllTrackArtist);

export default router;
