// import {types} from "mongoose";

export enum UserRole {
    SUPER_ADMIN = "super_admin",
    USER = "user",              
    ADMIN = "admin",
    SENDER = "sender",
    RECEIVER = "receiver",
    GUIDE = "guide",
}

export interface IUserAuth {
   provider: "google" | "credentials"; 
    providerId: string;
}
export enum UserStatus {
    ACTIVE = "ACTIVE",  
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
}
export interface IUser{
    id: string;
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
    isVerified?: boolean;
}