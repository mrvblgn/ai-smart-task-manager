import type { ITask, ITaskCreateInput, TaskDocument, TaskPriority, TaskStatus } from "./task.interface.js";
import type { ITaskRepository, TaskFilters } from "./task.repository.js";
import { Types } from "mongoose";

export interface PublicTask {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate?: Date;
	startDate?: Date;
	ownerId: string;
}

export interface CreateTaskInput {
	title: string;
	description?: string;
	status?: TaskStatus;
	priority?: TaskPriority;
	dueDate?: Date;
	startDate?: Date;
	ownerId: string;
}

export interface UpdateTaskInput {
	title?: string;
	description?: string;
	status?: TaskStatus;
	priority?: TaskPriority;
	dueDate?: Date;
	startDate?: Date;
}

export class TaskError extends Error {
	readonly statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "TaskError";
		this.statusCode = statusCode;
	}
}

export class NotFoundError extends TaskError {
	constructor(message: string) {
		super(message, 404);
		this.name = "NotFoundError";
	}
}

export class ValidationError extends TaskError {
	constructor(message: string) {
		super(message, 400);
		this.name = "ValidationError";
	}
}

export class UnauthorizedError extends TaskError {
	constructor(message: string) {
		super(message, 403);
		this.name = "UnauthorizedError";
	}
}

export class TaskService {
	private readonly taskRepository: ITaskRepository;

	constructor(taskRepository: ITaskRepository) {
		this.taskRepository = taskRepository;
	}

	async createTask(input: CreateTaskInput): Promise<PublicTask> {
		const title = input.title?.trim();
		if (!title) {
			throw new ValidationError("Title is required");
		}

		const ownerId = input.ownerId?.trim();
		if (!ownerId) {
			throw new ValidationError("Owner id is required");
		}

		const data: Partial<ITaskCreateInput> & { title: string; ownerId: Types.ObjectId } = {
			title,
			ownerId: new Types.ObjectId(ownerId),
		};

		if (input.description?.trim()) {
			data.description = input.description.trim();
		}

		if (input.status) {
			data.status = input.status;
		}

		if (input.priority) {
			data.priority = input.priority;
		}

		if (input.dueDate) {
			data.dueDate = input.dueDate;
		}

		if (input.startDate) {
			data.startDate = input.startDate;
		}

		const task = await this.taskRepository.createTask(data as ITaskCreateInput);
		return this.toPublicTask(task);
	}

	async getTaskById(id: string, userId?: string): Promise<PublicTask> {
		const normalizedId = id?.trim();
		if (!normalizedId) {
			throw new ValidationError("Task id is required");
		}

		const task = await this.taskRepository.findById(normalizedId);
		if (!task) {
			throw new NotFoundError("Task not found");
		}

		if (userId && task.ownerId.toString() !== userId) {
			throw new UnauthorizedError("You cannot access this task");
		}

		return this.toPublicTask(task);
	}

	async listTasksByOwner(ownerId: string, filters?: TaskFilters): Promise<PublicTask[]> {
		const normalizedOwnerId = ownerId?.trim();
		if (!normalizedOwnerId) {
			throw new ValidationError("Owner id is required");
		}

		const tasks = await this.taskRepository.findByOwnerId(normalizedOwnerId, filters);
		return tasks.map((task) => this.toPublicTask(task));
	}

	async updateTask(id: string, updates: UpdateTaskInput, userId?: string): Promise<PublicTask> {
		const normalizedId = id?.trim();
		if (!normalizedId) {
			throw new ValidationError("Task id is required");
		}

		const task = await this.taskRepository.findById(normalizedId);
		if (!task) {
			throw new NotFoundError("Task not found");
		}

		if (userId && task.ownerId.toString() !== userId) {
			throw new UnauthorizedError("You cannot update this task");
		}

		const normalizedUpdates: Partial<ITask> = {};

		if (updates.title?.trim()) {
			normalizedUpdates.title = updates.title.trim();
		} else if (updates.title !== undefined) {
			throw new ValidationError("Title cannot be empty");
		}

		if (updates.description?.trim()) {
			normalizedUpdates.description = updates.description.trim();
		}

		if (updates.status !== undefined) {
			normalizedUpdates.status = updates.status;
		}

		if (updates.priority !== undefined) {
			normalizedUpdates.priority = updates.priority;
		}

		if (updates.dueDate !== undefined) {
			normalizedUpdates.dueDate = updates.dueDate;
		}

		if (updates.startDate !== undefined) {
			normalizedUpdates.startDate = updates.startDate;
		}

		const updatedTask = await this.taskRepository.updateById(normalizedId, normalizedUpdates);
		if (!updatedTask) {
			throw new NotFoundError("Task not found");
		}

		return this.toPublicTask(updatedTask);
	}

	async deleteTask(id: string, userId?: string): Promise<void> {
		const normalizedId = id?.trim();
		if (!normalizedId) {
			throw new ValidationError("Task id is required");
		}

		const task = await this.taskRepository.findById(normalizedId);
		if (!task) {
			throw new NotFoundError("Task not found");
		}

		if (userId && task.ownerId.toString() !== userId) {
			throw new UnauthorizedError("You cannot delete this task");
		}

		const deletedTask = await this.taskRepository.deleteById(normalizedId);
		if (!deletedTask) {
			throw new NotFoundError("Task not found");
		}
	}

	private toPublicTask(task: TaskDocument): PublicTask {
		const result: PublicTask = {
			id: task.id,
			title: task.title,
			description: task.description,
			status: task.status,
			priority: task.priority,
			ownerId: task.ownerId.toString(),
		};

		if (task.dueDate) {
			result.dueDate = task.dueDate;
		}

		if (task.startDate) {
			result.startDate = task.startDate;
		}

		return result;
	}
}
