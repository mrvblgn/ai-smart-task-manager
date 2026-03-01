import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";

const app: Express = express();

/**
 * Request/Response types for better type safety
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

declare global {
  namespace Express {
    interface Response {
      success: <T>(data: T, message?: string, statusCode?: number) => Response;
      error: (message: string, statusCode?: number, error?: unknown) => Response;
    }
  }
}

/**
 * Middleware: CORS Configuration
 * Restrict API access to specified origins only
 */
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);

/**
 * Middleware: Body Parser
 * Parse incoming JSON and URL-encoded request bodies
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/**
 * Middleware: Request Logger (Development)
 * Log incoming requests for debugging
 */
if (env.nodeEnv === "development") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`📮 ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Custom Response Handlers
 * Standardized response format for API consistency
 */
app.use((_req: Request, res: Response, next: NextFunction) => {
  // Success response handler
  res.success = <T,>(data: T, message: string = "Success", statusCode: number = 200): Response => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    } as ApiResponse<T>);
  };

  // Error response handler
  res.error = (message: string, statusCode: number = 500, error?: unknown): Response => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(statusCode).json({
      success: false,
      message,
      error: env.nodeEnv === "development" ? errorMessage : undefined,
    } as ApiResponse);
  };

  next();
});

/**
 * Route: Root/Welcome
 * Basic endpoint to confirm API is running
 */
app.get("/", (_req: Request, res: Response) => {
  res.success(
    {
      name: "AI Smart Task Manager API",
      version: "1.0.0",
      health: "/api/health",
    },
    "Welcome to API"
  );
});

/**
 * Route: Health Check
 * Simple endpoint to verify API is running
 * Returns: status, uptime, and current timestamp
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.success(
    {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    "AI Smart Task Manager API is running"
  );
});

/**
 * Route: Authentication
 * Auth endpoints (login, register)
 */
app.use("/api/auth", authRoutes);

/**
 * Route: Users
 * User-related endpoints
 */
app.use("/api/users", userRoutes);

/**
 * Route: Tasks
 * Task-related endpoints
 */
app.use("/api/tasks", taskRoutes);

/**
 * Route: AI
 * AI-powered features (description generation, categorization)
 */
app.use("/api/ai", aiRoutes);

/**
 * Route: 404 Handler
 * Return 404 for undefined routes
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: `${req.method} ${req.path} does not exist`,
  } as ApiResponse);
});

/**
 * Global Error Handling Middleware
 * Catch all errors from routes and async functions
 * Must be defined last
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("🚨 Global Error Handler:", {
    message: err.message,
    stack: env.nodeEnv === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const typedError = err as Error & { statusCode?: number };
  const statusCode = typedError.statusCode ?? (res.statusCode === 200 ? 500 : res.statusCode);
  const errorMessage = env.nodeEnv === "production" ? "Internal Server Error" : err.message;

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: env.nodeEnv === "development" ? err.message : undefined,
  } as ApiResponse);
});

export default app;
