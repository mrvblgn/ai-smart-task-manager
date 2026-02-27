import { z } from "zod";

export const generateDescriptionSchema = z.object({
	title: z.string().trim().min(1, "Task title is required"),
	priority: z.enum(["low", "medium", "high"]).optional(),
});

export const categorizeTaskSchema = z.object({
	title: z.string().trim().min(1, "Task title is required"),
});

export type GenerateDescriptionInput = z.infer<typeof generateDescriptionSchema>;
export type CategorizeTaskInput = z.infer<typeof categorizeTaskSchema>;
