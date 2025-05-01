import { Router } from "express";
import { getAllGenres, getGenreById } from "../controller/genre.controller.js";

const router = Router()

router.get("/", getAllGenres)
router.get("/:genreId", getGenreById)

export default router;