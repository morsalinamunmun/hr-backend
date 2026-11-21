import { NextFunction, Request, Response, Router } from "express";
import { RequisitionController } from "./requisition.controller";
import { auth } from "../auth/auth.middleware";
import { UserRole } from "../user/user.interface";
import { uploadRequisitionSignature } from "./requisition.upload";

const router = Router();

// Token thakle req.user set hobe, na thakle o request cholbe
// (ager frontend jeta token chara call kore seta jate break na kore)
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) return next();
  return auth()(req, res, next);
};

// 1. User: requisition create (signature chara)
// frontend multipart/form-data pathay, tai .none() diye shudhu text field parse kori (file nibe na)
router.post(
  "/",
  optionalAuth,
  uploadRequisitionSignature.none(),
  RequisitionController.createRequisition
);

router.get("/", RequisitionController.getAllRequisition);

router.get("/:id", RequisitionController.getSingleRequisition);

router.patch(
  "/:id",
  optionalAuth,
  uploadRequisitionSignature.none(),
  RequisitionController.updateRequisition
);

// 2. Admin: verify (Checked By)
router.patch(
  "/:id/check",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  RequisitionController.checkRequisition
);

// 3. Super Admin: approve + signature (Approved By) — field name "signature"
router.patch(
  "/:id/approve",
  auth(UserRole.SUPER_ADMIN),
  uploadRequisitionSignature.single("signature"),
  RequisitionController.approveRequisition
);

router.patch(
  "/:id/reject",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  RequisitionController.rejectRequisition
);

router.delete("/:id", RequisitionController.deleteRequisition);

export const RequisitionRoutes = router;
