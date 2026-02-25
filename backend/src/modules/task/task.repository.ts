import type { ITask, ITaskCreateInput, TaskDocument, TaskStatus, TaskPriority } from "./task.interface.js";
import TaskModel from "./task.model.js";

export interface ITaskRepository {
	createTask(data: ITaskCreateInput): Promise<TaskDocument>;
	findById(id: string): Promise<TaskDocument | null>;
	findByOwnerId(ownerId: string, filters?: TaskFilters): Promise<TaskDocument[]>;
	updateById(id: string, updates: Partial<ITask>): Promise<TaskDocument | null>;
	deleteById(id: string): Promise<TaskDocument | null>;
}

export interface TaskFilters {
	status?: TaskStatus;
	priority?: TaskPriority;
	sortBy?: "createdAt" | "dueDate" | "priority";
	order?: "asc" | "desc";
}

export class TaskRepository implements ITaskRepository {
	async createTask(data: ITaskCreateInput): Promise<TaskDocument> {
		return TaskModel.create(data);
	}

	async findById(id: string): Promise<TaskDocument | null> {
		return TaskModel.findById(id).exec();
	}

	async findByOwnerId(ownerId: string, filters?: TaskFilters): Promise<TaskDocument[]> {
		const query: Record<string, unknown> = { ownerId };

		if (filters?.status) {
			query.status = filters.status;
		}

		if (filters?.priority) {
			query.priority = filters.priority;
		}

		const sortBy = filters?.sortBy || "createdAt";
		const order = filters?.order === "asc" ? 1 : -1;

		return TaskModel.find(query).sort({ [sortBy]: order }).exec();
	}

	async updateById(id: string, updates: Partial<ITask>): Promise<TaskDocument | null> {
		return TaskModel.findByIdAndUpdate(id, updates, { new: true }).exec();
	}

	async deleteById(id: string): Promise<TaskDocument | null> {
		return TaskModel.findByIdAndDelete(id).exec();
	}
}
