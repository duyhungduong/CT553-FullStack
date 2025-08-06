import { Instrument } from "../models/instrument.model.js";

export const getAllInstrument = async (req, res, next) => {
  try {
    const instruments = await Instrument.find();
    res.status(200).json(instruments);
  } catch (error) {
    next(error);
  }
};

export const getInstrumentById = async (req, res, next) => {
  try {
    const { instrumentId } = req.params;
    const instrument = await Instrument.findById(instrumentId);

    if (!instrument) {
      return res.status(404).json({ message: "Instrument not found" });
    }

    res.status(200).json(instrument);
  } catch (error) {
    next(error);
  }
};
