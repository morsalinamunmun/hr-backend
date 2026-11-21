import { Types } from "mongoose";

export enum LunchOption {
  YES = "Yes",
  NO = "No",
}

export interface ILunch {
  user: Types.ObjectId | string; // je entry dicche (logged-in user)
  date: string; // "YYYY-MM-DD"
  lunch: LunchOption; // Yes / No
  count: number; // Yes = 1, No = 0
}
