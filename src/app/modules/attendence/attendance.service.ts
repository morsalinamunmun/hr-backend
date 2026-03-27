/* eslint-disable @typescript-eslint/no-explicit-any */

import { Attendance } from "./attendance.model";

interface MarkAttendancePayload {
  user_id: string;
  work_type: string;
  latitude: number;
  longitude: number;
  address?: string;
  photo?: string;
  timestamp: string | Date;
  type: "check-in" | "check-out";
}

const markAttendance = async (payload: MarkAttendancePayload) => {
  const { user_id, work_type, latitude, longitude, address, photo, timestamp, type } = payload;

  // আজকের date
  const today = new Date().toISOString().split("T")[0];

  // একই user, same date খুঁজে বের করা
  let attendance = await Attendance.findOne({ user_id, date: today });

  console.log("Attendance found:", attendance); // Debugging

  if (type === "check-in") {
    // duplicate check-in block
    if (attendance?.check_in?.timestamp) {
      return { success: false, message: "Check-in already done for today" };
    }

    // যদি কোন document না থাকে
    if (!attendance) {
      attendance = await Attendance.create({
        user_id,
        work_type,
        date: today,
        check_in: {
          timestamp: new Date(timestamp),
          location: { latitude, longitude, address },
          photo,
        },
        // check_out intentionally not set - will be undefined
      });
    } else {
      // আগের document update (যেখানে check_in নেই কিন্তু check_out থাকতে পারে)
      attendance.check_in = {
        timestamp: new Date(timestamp),
        location: { latitude, longitude, address },
        photo,
      };
      await attendance.save();
    }

    return { success: true, message: "Checked in successfully", data: attendance };
  }

  if (type === "check-out") {
    // check-in করা আছে কিনা validate
    if (!attendance?.check_in?.timestamp) {
      return { success: false, message: "Cannot check-out before check-in" };
    }

    // duplicate check-out block - properly check if check_out exists with data
    if (attendance.check_out?.timestamp) {
      return { success: false, message: "Check-out already done for today" };
    }

    // Additional checks to be absolutely sure
    if (attendance.check_out && Object.keys(attendance.check_out).length > 0) {
      // Check if it has any meaningful data
      if (attendance.check_out.location || attendance.check_out.photo) {
        return { success: false, message: "Check-out already done for today" };
      }
    }

    // check-out save
    attendance.check_out = {
      timestamp: new Date(timestamp),
      location: { latitude, longitude, address },
      photo,
    };
    await attendance.save();

    return { success: true, message: "Checked out successfully", data: attendance };
  }

  return { success: false, message: "Invalid attendance type" };
};

// user এর history
const getUserAttendance = async (userId: string) => {
  const records = await Attendance.find({ user_id: userId }).sort({ date: -1 });
  return records;
};

// get all attendance
const getAllAttendance = async (query: any) => {
  const { 
    startDate, 
    endDate, 
    employee_id, 
    page = 1, 
    limit = 10 
  } = query;

  const match: any = {};

  if (startDate && endDate) {
    match.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const pipeline: any[] = [
    { $match: match },

    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    // employee_id filter এখানে apply হবে 🔥
    ...(employee_id
      ? [{ $match: { "user.employee_id": employee_id } }]
      : []),

    { $sort: { date: -1 } },

    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: Number(limit) },
        ],
        total: [
          { $count: "count" }
        ],
      },
    },
  ];

  const result = await Attendance.aggregate(pipeline);

  const data = result[0].data;
  const total = result[0].total[0]?.count || 0;

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPage: Math.ceil(total / limit),
    },
  };
};

// Get today's attendance for a user
const getTodayAttendance = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];
  const attendance = await Attendance.findOne({ user_id: userId, date: today });
  return attendance;
};

// Update check-out (if needed for corrections)
const updateCheckOut = async (userId: string, payload: Partial<MarkAttendancePayload>) => {
  const today = new Date().toISOString().split("T")[0];
  const { latitude, longitude, address, photo, timestamp } = payload;

  const attendance = await Attendance.findOne({ user_id: userId, date: today });

  if (!attendance) {
    return { success: false, message: "No attendance record found for today" };
  }

  if (!attendance.check_in) {
    return { success: false, message: "Cannot update check-out before check-in" };
  }

  attendance.check_out = {
    timestamp: new Date(timestamp || new Date()),
    location: { 
      latitude: latitude || attendance.check_in.location.latitude,
      longitude: longitude || attendance.check_in.location.longitude,
      address: address || attendance.check_in.location.address 
    },
    photo: photo || attendance.check_in.photo,
  };
  
  await attendance.save();

  return { success: true, message: "Check-out updated successfully", data: attendance };
};

export const AttendanceService = {
  markAttendance,
  getUserAttendance,
  getAllAttendance,
  getTodayAttendance,
  updateCheckOut,
};