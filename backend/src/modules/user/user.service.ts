import type { IUserRepository } from "./user.repository.js";
import type { UserDocument } from "./user.interface.js";

export interface PublicUser {
	id: string;
	name: string;
	email: string;
	role: string;
}

export class UserError extends Error {
	readonly statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "UserError";
		this.statusCode = statusCode;
	}
}

export class NotFoundError extends UserError {
	constructor(message: string) {
		super(message, 404);
		this.name = "NotFoundError";
	}
}

export class ValidationError extends UserError {
	constructor(message: string) {
		super(message, 400);
		this.name = "ValidationError";
	}
}

export class UserService {
	private readonly userRepository: IUserRepository;

	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	async getUserById(id: string): Promise<PublicUser> {
		if (!id) {
			throw new ValidationError("User id is required");
		}

		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		return this.toPublicUser(user);
	}

	async getUserByEmail(email: string): Promise<PublicUser> {
		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail) {
			throw new ValidationError("Email is required");
		}

		const user = await this.userRepository.findByEmail(normalizedEmail);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		return this.toPublicUser(user);
	}

	private toPublicUser(user: UserDocument): PublicUser {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		};
	}
}
