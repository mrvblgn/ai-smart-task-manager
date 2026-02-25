import mongoose, { Schema } from "mongoose";
import type { Model } from "mongoose";
import type { IUser } from "./user.interface.js";

const UserSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			index: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
	},
	{
		timestamps: true,
	}
);

const UserModel = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
