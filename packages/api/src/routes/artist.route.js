import { Router } from "express";
import { getAllArtist, getArtistById } from "../controller/artist.controller.js";

const router = Router()

router.get("/", getAllArtist);
router.get("/:artistId", getArtistById);


export default router;