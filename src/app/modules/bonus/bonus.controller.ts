import { Request, Response } from "express";
import { BonusService } from "./bonus.service";

// CREATE
const createBonus = async (req: Request, res: Response) => {
  const result = await BonusService.createBonus(req.body);
  res.status(201).json(result);
};

// GET ALL
//  const getAllBonus = async (req: Request, res: Response) => {
//   const result = await BonusService.getAllBonus();
//   res.json(result);
// };

const getAllBonus = async (req: Request, res: Response) => {
  const { page, limit, search, fromDate, toDate } = req.query;

  const result = await BonusService.getAllBonus({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: search as string,
    fromDate: fromDate as string,
    toDate: toDate as string,
  });

  res.json(result);
};

// UPDATE
 const updateBonus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BonusService.updateBonus(id, req.body);
  res.json(result);
};

// DELETE
 const deleteBonus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BonusService.deleteBonus(id);
  res.json(result);
};

export const BonusController = {
  createBonus,
  getAllBonus,
  updateBonus,
  deleteBonus,
};