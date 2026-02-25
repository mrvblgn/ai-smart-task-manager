import type { Request, Response, NextFunction } from "express";
import type { AuthService } from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { ValidationError } from "../user/user.service.js";

export class AuthController {
	private readonly authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;
	}

	register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const parsed = registerSchema.safeParse(req.body);
			if (!parsed.success) {
				throw new ValidationError(parsed.error.issues[0]?.message || "Invalid input");
			}

			const result = await this.authService.register(
				parsed.data.name,
				parsed.data.email,
				parsed.data.password
			);

			res.success(result, "User registered successfully", 201);
		} catch (error) {
			next(error);
		}
	};

	login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const parsed = loginSchema.safeParse(req.body);
			if (!parsed.success) {
				throw new ValidationError(parsed.error.issues[0]?.message || "Invalid input");
			}

			const result = await this.authService.login(parsed.data.email, parsed.data.password);

			res.success(result, "Login successful");
		} catch (error) {
			next(error);
		}
	};
}
