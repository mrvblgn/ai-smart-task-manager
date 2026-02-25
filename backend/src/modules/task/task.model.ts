import mongoose, { Schema } from "mongoose";
import type { Model } from "mongoose";
import type { ITask } from "./task.interface.js";

const TaskSchema = new Schema<ITask>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			default: "",
		},
		status: {
			type: String,
			enum: ["todo", "in_progress", "done"],
			default: "todo",
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high"],
			default: "medium",
		},
		dueDate: {
			type: Date,
			default: undefined,
		},
		startDate: {
			type: Date,
			default: undefined,
		},
		ownerId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

const TaskModel = (mongoose.models.Task as Model<ITask>) || mongoose.model<ITask>("Task", TaskSchema);

export default TaskModel;
