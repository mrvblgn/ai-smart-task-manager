import type { Request, Response, NextFunction } from "express";

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
	const userRole = req.user?.role;

	if (!userRole) {
		res.error("Unauthorized", 401);
		return;
	}

	if (userRole !== "admin") {
		res.error("Admin access required", 403);
		return;
	}

	next();
};

export const requireRole = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const userRole = req.user?.role;

		if (!userRole) {
			res.error("Unauthorized", 401);
			return;
		}

		if (!roles.includes(userRole)) {
			res.error("Insufficient permissions", 403);
			return;
		}

		next();
	};
};
