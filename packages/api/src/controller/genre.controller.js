import { Genre } from "../models/genre.model.js";
export const getAllGenres = async (req, res, next) => {
  try {
    const genres = await Genre.find();

    res.status(200).json(genres);
  } catch (error) {
    next(error);
  }
};

export const getGenreById = async (req, res, next) => {
  try {
    const { genreId } = req.params;

    const genre = await Genre.findById(genreId);

    if (!genre) {
      return res.status(404).json({ message: "Genre not found" });
    }

    res.status(200).json(genre);
  } catch (error) {
    next(error);
  }
};
