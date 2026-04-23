/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bonus } from "./bonus.model";

// CREATE
const createBonus = async (payload: any) => {
  const result = await Bonus.create(payload);

  return {
    success: true,
    message: "Bonus created successfully",
    data: result,
  };
};

// GET ALL
const getAllBonus = async () => {
  const result = await Bonus.find().sort({ createdAt: -1 });

  return {
    success: true,
    data: result,
  };
};

// UPDATE
const updateBonus = async (id: string, payload: any) => {
  const result = await Bonus.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!result) {
    return { success: false, message: "Bonus not found" };
  }

  return {
    success: true,
    message: "Bonus updated successfully",
    data: result,
  };
};

// DELETE
const deleteBonus = async (id: string) => {
  const result = await Bonus.findByIdAndDelete(id);

  if (!result) {
    return { success: false, message: "Bonus not found" };
  }

  return {
    success: true,
    message: "Bonus deleted successfully",
  };
};

export const BonusService = {
  createBonus,
  getAllBonus,
  updateBonus,
  deleteBonus,
};