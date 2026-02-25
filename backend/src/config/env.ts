import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variable interface for type safety
 */
interface IEnvironmentConfig {
  port: number;
  nodeEnv: "development" | "production" | "test";
  mongoUri: string;
  jwtSecret: string;
  jwtExpiry: string;
  corsOrigin: string[];
}

/**
 * Validate required environment variables
 * Throws error if any required variable is missing
 */
const validateEnvVariables = (): void => {
  const requiredVars = ["PORT", "MONGO_URI", "JWT_SECRET"];
  const missingVars = requiredVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};

/**
 * Parse and validate CORS origin configuration
 */
const parseCorsOrigin = (): string[] => {
  const corsEnv = process.env.CORS_ORIGIN || "http://localhost:3000";
  return corsEnv.split(",").map((origin) => origin.trim());
};

/**
 * Parse and validate JWT expiry
 */
const parseJwtExpiry = (): string => {
  return process.env.JWT_EXPIRY || "7d";
};

/**
 * Centralized environment configuration
 * Validates and exposes all required environment variables with proper types
 */
const getEnvironmentConfig = (): IEnvironmentConfig => {
  validateEnvVariables();

  return {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
    mongoUri: process.env.MONGO_URI!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiry: parseJwtExpiry(),
    corsOrigin: parseCorsOrigin(),
  };
};

export const env = getEnvironmentConfig();
