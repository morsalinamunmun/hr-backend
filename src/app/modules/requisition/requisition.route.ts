import { Router } from "express";
import { RequisitionController } from "./requisition.controller";

const router = Router();

router.post("/", RequisitionController.createRequisition);

router.get("/", RequisitionController.getAllRequisition);

router.get("/:id", RequisitionController.getSingleRequisition);

router.patch("/:id", RequisitionController.updateRequisition);

router.delete("/:id", RequisitionController.deleteRequisition);

export const RequisitionRoutes = router;