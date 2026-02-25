import type { Request, Response, NextFunction } from "express";
import type { TaskService } from "./task.service.js";
import { ValidationError } from "./task.service.js";
import { createTaskSchema, taskIdSchema, updateTaskSchema, listTasksQuerySchema } from "./task.validation.js";

export class TaskController {
	private readonly taskService: TaskService;

	constructor(taskService: TaskService) {
		this.taskService = taskService;
	}

	createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const ownerId = req.user?.id;
			if (!ownerId) {
				res.error("Unauthorized", 401);
				return;
			}

			const parsed = createTaskSchema.safeParse(req.body);
			if (!parsed.success) {
				throw new ValidationError(parsed.error.issues[0]?.message || "Invalid task data");
			}

			const task = await this.taskService.createTask({ ...parsed.data, ownerId });
			res.success(task, "Task created", 201);
		} catch (error) {
			next(error);
		}
	};

	listMyTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const ownerId = req.user?.id;
			if (!ownerId) {
				res.error("Unauthorized", 401);
				return;
			}

			const parsed = listTasksQuerySchema.safeParse(req.query);
			if (!parsed.success) {
				throw new ValidationError(parsed.error.issues[0]?.message || "Invalid query parameters");
			}

			const tasks = await this.taskService.listTasksByOwner(ownerId, parsed.data);
			res.success(tasks, "Tasks fetched");
		} catch (error) {
			next(error);
		}
	};

	getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.error("Unauthorized", 401);
				return;
			}

			const parsed = taskIdSchema.safeParse(req.params);
			if (!parsed.success) {
				throw new ValidationError(parsed.error.issues[0]?.message || "Task id is required");
			}

			const task = await this.taskService.getTaskById(parsed.data.id, userId);
			res.success(task, "Task fetched");
		} catch (error) {
			next(error);
		}
	};

	updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.error("Unauthorized", 401);
				return;
			}

			const params = taskIdSchema.safeParse(req.params);
			if (!params.success) {
				throw new ValidationError(params.error.issues[0]?.message || "Task id is required");
			}

			const body = updateTaskSchema.safeParse(req.body);
			if (!body.success) {
				throw new ValidationError(body.error.issues[0]?.message || "Invalid task data");
			}

			const task = await this.taskService.updateTask(params.data.id, body.data, userId);
			res.success(task, "Task updated");
		} catch (error) {
			next(error);
		}
	};

	deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.error("Unauthorized", 401);
				return;
			}

			const parsed = taskIdSchema.safeParse(req.params);
			if (!parsed.success) {
				throw new ValidationError(parsed.error.issues[0]?.message || "Task id is required");
			}

			await this.taskService.deleteTask(parsed.data.id, userId);
			res.success({ id: parsed.data.id }, "Task deleted");
		} catch (error) {
			next(error);
		}
	};
}
