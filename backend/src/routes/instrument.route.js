import { Router } from "express";
import {
  getAllInstrument,
  getInstrumentById,
} from "../controller/instrument.controller.js";
import { getSongsByInstrument } from "../controller/song.controller.js";

const router = Router();

router.get("/", getAllInstrument);
router.get("/:instrumentId", getInstrumentById);
router.get("/:instrumentId/song-by-instrument",getSongsByInstrument);

export default router;
