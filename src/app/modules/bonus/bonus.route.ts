import express from "express";
import { BonusController } from "./bonus.controller";


const router = express.Router();

router.post("/", BonusController.createBonus);
router.get("/", BonusController.getAllBonus);
router.patch("/:id", BonusController.updateBonus);
router.delete("/:id", BonusController.deleteBonus);

export const BonusRoutes = router;
