import { model, Schema } from "mongoose";
import { IUser, IUserAuth, UserRole, UserStatus, UserVerified } from "./user.interface";

const authProviderSchema = new Schema<IUserAuth>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<IUser>({
name: {
    type: String,
    required: true,
},
email: {
    type: String,   
    required: true,
    unique: true,
},
password: {
    type: String,
    required: false,
},
role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
},
phone: {
    type: String,
},
address: {
    type: String,
},
picture: {  
    type: String,
},
isDeleted: {
    type: Boolean,
    default: false,
},
isActive: {
    type: String,   
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
},
// isVerified: {   
//     type: Boolean,
//     default: false,
// },
isVerified: {   
    type: String,
    enum: Object.values(UserVerified),
    default: UserVerified.PENDING,
},
auth: [authProviderSchema]
},{
    timestamps: true,
    versionKey: false,
}
)

export const User = model<IUser>("User", userSchema);