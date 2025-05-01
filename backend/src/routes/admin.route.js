import { Router } from "express";
import {
  checkAdmin,
  createAlbum,
  createArtist,
  createGenre,
  createInstrument,
  createSong,
  deleteAlbum,
  deleteArtist,
  deleteSong,
  updateAlbum,
  updateArtist,
  updateSong,
} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

router.post("/artists", createArtist);
router.delete("/artists/:id", deleteArtist);

router.post("/genres", createGenre);

router.post("/instruments", createInstrument);

//Update
router.put("/update/songs/:id", updateSong);
router.put("/update/albums/:id", updateAlbum);
router.put("/update/artists/:id", updateArtist);

export default router;
