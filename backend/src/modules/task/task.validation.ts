import { z } from "zod";

const statusEnum = z.enum(["todo", "in_progress", "done"]);
const priorityEnum = z.enum(["low", "medium", "high"]);

const dateSchema = z.preprocess((value) => {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}

	if (value instanceof Date) {
		return value;
	}

	if (typeof value === "string" || typeof value === "number") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? value : parsed;
	}

	return value;
}, z.date().optional());

export const taskIdSchema = z.object({
	id: z.string().trim().min(1, "Task id is required"),
});

export const createTaskSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	description: z.string().trim().min(1).optional(),
	status: statusEnum.optional(),
	priority: priorityEnum.optional(),
	dueDate: dateSchema,
	startDate: dateSchema,
});

export const updateTaskSchema = z
	.object({
		title: z.string().trim().min(1).optional(),
		description: z.string().trim().min(1).optional(),
		status: statusEnum.optional(),
		priority: priorityEnum.optional(),
		dueDate: dateSchema,
		startDate: dateSchema,
	})
	.refine((data) => Object.values(data).some((value) => value !== undefined), {
		message: "At least one field is required",
	});

export const listTasksQuerySchema = z.object({
	status: statusEnum.optional(),
	priority: priorityEnum.optional(),
	sortBy: z.enum(["createdAt", "dueDate", "priority"]).optional(),
	order: z.enum(["asc", "desc"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
