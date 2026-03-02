import { Request, Response } from "express";
import { AttendanceService } from "./attendance.service";

export const AttendanceController = {
  markAttendance: async (req: Request, res: Response) => {
    try {
      const result = await AttendanceService.markAttendance(req.body);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },

  getUserAttendance: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const records = await AttendanceService.getUserAttendance(userId);
      res.status(200).json({ success: true, data: records });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
};