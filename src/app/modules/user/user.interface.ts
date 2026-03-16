// import {types} from "mongoose";

export enum UserRole {
    SUPER_ADMIN = "super_admin",
    USER = "user",              
    ADMIN = "admin",
}

export interface IUserAuth {
   provider: "google" | "credentials"; 
    providerId: string;
}
export enum UserStatus {
      PENDING = "PENDING", 
    ACTIVE = "ACTIVE",  
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
}
export enum UserVerified {
      PENDING = "PENDING", 
   APPROVED= "APPROVED"
}
export enum WorkType {
  FIELD = "field",
  OFFICE = "office",
}
export interface IUser{
    _id: string;
    employee_id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    auth: IUserAuth[];
    phone?: string;
    address?: string;
    picture?: string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: UserStatus;
    isVerified?: UserVerified;
    work_type: WorkType;
}