import { Router } from "express";
import { Attendance } from "./attendance.model";

export const AttendanceRoutes = Router();

AttendanceRoutes.post("/mark", async (req, res) => {
  try {
    const { user_id, work_type, latitude, longitude, timestamp } = req.body;
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    let attendance = await Attendance.findOne({ user_id, date });

    if (!attendance) {
    
      // Check-in
      attendance = await Attendance.create({
        user_id,
        work_type,
        date,
        check_in: { timestamp, location: { latitude, longitude } },
      });
      return res.json({ success: true, type: "check-in", message: "Checked in successfully" });
    } else if (!attendance.check_out) {
      // Check-out
      attendance.check_out = { timestamp, location: { latitude, longitude } };
      await attendance.save();
      return res.json({ success: true, type: "check-out", message: "Checked out successfully" });
    } else {
      return res.json({ success: false, message: "Attendance already completed for today" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
