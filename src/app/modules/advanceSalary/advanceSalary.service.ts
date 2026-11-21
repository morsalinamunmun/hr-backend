/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Employee } from "../employee/employee.model";
import { User } from "../user/user.model";
import { AdvanceSalaryStatus } from "./advanceSalary.interface";
import { AdvanceSalary } from "./advanceSalary.model";

const EMPLOYEE_FIELDS =
  "employee_name employee_id department designation branch_name basic_salary image";

const round2 = (n: number) => Math.round(n * 100) / 100;

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const validateMonth = (month: string, field = "month") => {
  if (!MONTH_REGEX.test(month)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid ${field}, use YYYY-MM format`
    );
  }
};

// Amount / Installments validate kore deductionPerMonth ber kore
const calculatePlan = (amountRaw: any, installmentsRaw: any) => {
  const amount = Number(amountRaw);
  const installments = Number(installmentsRaw);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }
  if (!Number.isInteger(installments) || installments < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Number of installments must be a whole number (at least 1)"
    );
  }

  return {
    amount: round2(amount),
    installments,
    deductionPerMonth: round2(amount / installments),
  };
};

const getUserName = async (userId?: string) => {
  if (!userId) return undefined;
  const user = await User.findById(userId).select("name").lean();
  return user?.name;
};

const findOrThrow = async (id: string) => {
  const advance = await AdvanceSalary.findById(id);
  if (!advance) {
    throw new AppError(httpStatus.NOT_FOUND, "Advance salary not found");
  }
  return advance;
};

// Ek employee er ekta Pending/Approved advance thakle notun request neya jabe na
const ensureNoActiveAdvance = async (employeeId: string, excludeId?: string) => {
  const filter: any = {
    employee: employeeId,
    status: {
      $in: [AdvanceSalaryStatus.PENDING, AdvanceSalaryStatus.APPROVED],
    },
  };
  if (excludeId) filter._id = { $ne: excludeId };

  const active = await AdvanceSalary.findOne(filter).lean();
  if (active) {
    throw new AppError(
      httpStatus.CONFLICT,
      `This employee already has a ${active.status.toLowerCase()} advance salary`
    );
  }
};

const createAdvanceSalary = async (payload: any, userId?: string) => {
  const employeeId = payload.employee;

  if (!employeeId || !Types.ObjectId.isValid(employeeId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Valid employee is required");
  }

  const employee = await Employee.findById(employeeId).select("_id").lean();
  if (!employee) {
    throw new AppError(httpStatus.NOT_FOUND, "Employee not found");
  }

  const plan = calculatePlan(payload.amount, payload.installments);

  if (payload.startMonth) validateMonth(payload.startMonth, "startMonth");

  await ensureNoActiveAdvance(employeeId);

  const created = await AdvanceSalary.create({
    employee: employeeId,
    ...plan,
    reason: payload.reason,
    startMonth: payload.startMonth,
    remainingAmount: plan.amount,
    requestedBy: userId,
  });

  return await created.populate("employee", EMPLOYEE_FIELDS);
};

const getAllAdvanceSalary = async (query: {
  page?: string;
  limit?: string;
  status?: string;
  employee?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.status) filter.status = query.status;
  if (query.employee) filter.employee = query.employee;

  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate) {
      const end = new Date(query.toDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const [data, total] = await Promise.all([
    AdvanceSalary.find(filter)
      .populate("employee", EMPLOYEE_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AdvanceSalary.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getEmployeeAdvanceSalary = async (employeeId: string) => {
  return await AdvanceSalary.find({ employee: employeeId })
    .populate("employee", EMPLOYEE_FIELDS)
    .sort({ createdAt: -1 });
};

const getSingleAdvanceSalary = async (id: string) => {
  const advance = await findOrThrow(id);
  return await advance.populate("employee", EMPLOYEE_FIELDS);
};

// Shudhu Pending obosthay edit kora jabe
const updateAdvanceSalary = async (id: string, payload: any) => {
  const advance = await findOrThrow(id);

  if (advance.status !== AdvanceSalaryStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${advance.status} advance salary cannot be updated`
    );
  }

  if (payload.employee !== undefined) {
    if (!Types.ObjectId.isValid(payload.employee)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Valid employee is required");
    }
    const employee = await Employee.findById(payload.employee)
      .select("_id")
      .lean();
    if (!employee) {
      throw new AppError(httpStatus.NOT_FOUND, "Employee not found");
    }
    await ensureNoActiveAdvance(payload.employee, id);
    advance.employee = payload.employee;
  }

  if (payload.amount !== undefined || payload.installments !== undefined) {
    const plan = calculatePlan(
      payload.amount ?? advance.amount,
      payload.installments ?? advance.installments
    );
    advance.amount = plan.amount;
    advance.installments = plan.installments;
    advance.deductionPerMonth = plan.deductionPerMonth;
    advance.remainingAmount = plan.amount;
  }

  if (payload.reason !== undefined) advance.reason = payload.reason;

  if (payload.startMonth !== undefined) {
    if (payload.startMonth) validateMonth(payload.startMonth, "startMonth");
    advance.startMonth = payload.startMonth || undefined;
  }

  await advance.save();
  return await advance.populate("employee", EMPLOYEE_FIELDS);
};

const approveAdvanceSalary = async (
  id: string,
  userId: string,
  payload: { startMonth?: string }
) => {
  const advance = await findOrThrow(id);

  if (advance.status !== AdvanceSalaryStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Advance salary already ${advance.status.toLowerCase()}`
    );
  }

  const startMonth = payload.startMonth || advance.startMonth || currentMonth();
  validateMonth(startMonth, "startMonth");

  advance.startMonth = startMonth;
  advance.status = AdvanceSalaryStatus.APPROVED;
  advance.approvedBy = {
    user: userId,
    name: await getUserName(userId),
    date: new Date(),
  };

  await advance.save();
  return await advance.populate("employee", EMPLOYEE_FIELDS);
};

const rejectAdvanceSalary = async (
  id: string,
  userId: string,
  payload: { reason?: string }
) => {
  const advance = await findOrThrow(id);

  if (advance.status !== AdvanceSalaryStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Advance salary already ${advance.status.toLowerCase()}`
    );
  }

  advance.status = AdvanceSalaryStatus.REJECTED;
  advance.rejectionReason = payload.reason;
  advance.rejectedBy = {
    user: userId,
    name: await getUserName(userId),
    date: new Date(),
  };

  await advance.save();
  return await advance.populate("employee", EMPLOYEE_FIELDS);
};

// Protimash e ekta kisti kata (salary theke deduction)
const addDeduction = async (
  id: string,
  payload: { month?: string; amount?: any; note?: string }
) => {
  const advance = await findOrThrow(id);

  if (advance.status !== AdvanceSalaryStatus.APPROVED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      advance.status === AdvanceSalaryStatus.COMPLETED
        ? "All installments already paid"
        : "Only approved advance salary can be deducted"
    );
  }

  const month = payload.month || currentMonth();
  validateMonth(month);

  if (advance.startMonth && month < advance.startMonth) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Deduction starts from ${advance.startMonth}`
    );
  }

  if (advance.deductions.some((d) => d.month === month)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Installment for ${month} already deducted`
    );
  }

  const remaining = round2(advance.remainingAmount);
  const isLastInstallment = advance.paidInstallments + 1 >= advance.installments;

  // amount na dile: normal kisti, shesh kisti hole baki purota
  let amount =
    payload.amount !== undefined && payload.amount !== ""
      ? Number(payload.amount)
      : isLastInstallment
      ? remaining
      : Math.min(advance.deductionPerMonth, remaining);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid deduction amount");
  }
  amount = round2(amount);

  if (amount > remaining) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Deduction cannot exceed remaining amount (${remaining})`
    );
  }

  advance.deductions.push({
    month,
    amount,
    date: new Date(),
    note: payload.note,
  });
  advance.paidInstallments += 1;
  advance.paidAmount = round2(advance.paidAmount + amount);
  advance.remainingAmount = round2(remaining - amount);

  if (advance.remainingAmount <= 0) {
    advance.remainingAmount = 0;
    advance.status = AdvanceSalaryStatus.COMPLETED;
  }

  await advance.save();
  return await advance.populate("employee", EMPLOYEE_FIELDS);
};

// Pending ba Rejected hole delete kora jabe
const deleteAdvanceSalary = async (id: string) => {
  const advance = await findOrThrow(id);

  if (
    advance.status === AdvanceSalaryStatus.APPROVED ||
    advance.status === AdvanceSalaryStatus.COMPLETED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${advance.status} advance salary cannot be deleted`
    );
  }

  await advance.deleteOne();
  return advance;
};

export const AdvanceSalaryService = {
  createAdvanceSalary,
  getAllAdvanceSalary,
  getEmployeeAdvanceSalary,
  getSingleAdvanceSalary,
  updateAdvanceSalary,
  approveAdvanceSalary,
  rejectAdvanceSalary,
  addDeduction,
  deleteAdvanceSalary,
};
