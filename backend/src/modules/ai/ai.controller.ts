import type { Request, Response, NextFunction } from "express";
import type { AIService } from "./ai.service.js";
import type { GenerateDescriptionInput } from "./ai.service.js";
import { AIError } from "./ai.service.js";
import { generateDescriptionSchema, categorizeTaskSchema } from "./ai.validation.js";

export class AIController {
	private readonly aiService: AIService;

	constructor(aiService: AIService) {
		this.aiService = aiService;
	}

	generateDescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const parsed = generateDescriptionSchema.safeParse(req.body);
			if (!parsed.success) {
				throw new AIError(parsed.error.issues[0]?.message || "Invalid input", 400);
			}

			const input: GenerateDescriptionInput = {
				title: parsed.data.title,
				priority: (parsed.data.priority || "medium") as "low" | "medium" | "high",
			};

			const description = await this.aiService.generateDescription(input);
			res.success({ description }, "Description generated successfully");
		} catch (error) {
			next(error);
		}
	};

	categorizeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const parsed = categorizeTaskSchema.safeParse(req.body);
			if (!parsed.success) {
				throw new AIError(parsed.error.issues[0]?.message || "Invalid input", 400);
			}

			const category = await this.aiService.categorizeTask(parsed.data.title);
			res.success({ category }, "Task categorized successfully");
		} catch (error) {
			next(error);
		}
	};
}
