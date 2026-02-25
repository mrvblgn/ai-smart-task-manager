import type { HydratedDocument, Types } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ITask {
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: Date | undefined;
	startDate: Date | undefined;
	ownerId: Types.ObjectId;
}

export interface ITaskCreateInput {
	title: string;
	description?: string;
	status?: TaskStatus;
	priority?: TaskPriority;
	dueDate?: Date;
	startDate?: Date;
	ownerId: Types.ObjectId;
}

export type TaskDocument = HydratedDocument<ITask>;
