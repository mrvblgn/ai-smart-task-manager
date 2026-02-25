import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../modules/user/user.interface.js";

export interface AuthPayload extends JwtPayload {
	sub: string;
	role: UserRole;
}

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				role: UserRole;
			};
		}
	}
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
	const authHeader = req.headers.authorization;
	const value = Array.isArray(authHeader) ? authHeader[0] : authHeader;

	if (!value || !value.startsWith("Bearer ")) {
		res.error("Unauthorized", 401);
		return;
	}

	const token = value.slice("Bearer ".length).trim();
	if (!token) {
		res.error("Unauthorized", 401);
		return;
	}

	try {
		const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
		if (!payload?.sub || !payload?.role) {
			res.error("Unauthorized", 401);
			return;
		}

		req.user = { id: payload.sub, role: payload.role };
		next();
	} catch (error) {
		res.error("Invalid token", 401, error);
	}
};
