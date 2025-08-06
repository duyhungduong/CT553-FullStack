import { Router } from "express";
import { getAllTrackInstrument } from "../controller/trackInstrument.controller.js";

const router = Router();

router.get("/", getAllTrackInstrument)

export default router;