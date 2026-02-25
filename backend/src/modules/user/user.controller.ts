import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "./user.service.js";
import type { UserService } from "./user.service.js";

export class UserController {
	private readonly userService: UserService;

	constructor(userService: UserService) {
		this.userService = userService;
	}

	getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const id = req.params.id;
			if (typeof id !== "string" || id.trim() === "") {
				throw new ValidationError("User id is required");
			}

			const user = await this.userService.getUserById(id);
			res.success(user, "User fetched");
		} catch (error) {
			next(error);
		}
	};

	getUserByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { email } = req.query;
			if (typeof email !== "string" || email.trim() === "") {
				throw new ValidationError("Email is required");
			}

			const user = await this.userService.getUserByEmail(email);
			res.success(user, "User fetched");
		} catch (error) {
			next(error);
		}
	};
}
