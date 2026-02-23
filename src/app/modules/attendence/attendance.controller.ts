import { Request, Response } from "express";
import { Attendance } from "./attendance.model";

export const AttendanceController = {

  // 🔹 Mark Attendance
  markAttendance: async (req: Request, res: Response) => {
    try {
      const {
        user_id,
        work_type,
        latitude,
        longitude,
        address,
        photo,
        timestamp,
      } = req.body;

      const date = new Date().toISOString().split("T")[0];

      let attendance = await Attendance.findOne({ user_id, date });

      // 🟢 CHECK IN
      if (!attendance) {
        const newAttendance = await Attendance.create({
          user_id,
          work_type,
          date,
          check_in: {
            timestamp,
            location: { latitude, longitude, address },
            photo,
          },
        });

        return res.status(200).json({
          success: true,
          message: "Checked in successfully",
          data: newAttendance,
        });
      }

      // 🟢 CHECK OUT
      if (!attendance.check_out) {
        attendance.check_out = {
          timestamp,
          location: { latitude, longitude, address },
          photo,
        };

        await attendance.save();

        return res.status(200).json({
          success: true,
          message: "Checked out successfully",
          data: attendance,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Attendance already completed for today",
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },

  // 🔹 Get user attendance history
  getUserAttendance: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const records = await Attendance.find({ user_id: userId })
        .sort({ date: -1 });

      return res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
};