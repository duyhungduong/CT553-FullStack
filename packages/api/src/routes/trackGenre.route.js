import { Router } from "express";
import { getAllTrackGenre } from "../controller/trackGenre.controller.js";
const router = Router();
router.get("/", getAllTrackGenre);
export default router;
