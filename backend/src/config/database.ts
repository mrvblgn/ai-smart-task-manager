import mongoose from "mongoose";
import type { Connection } from "mongoose";
import { env } from "./env.js";

let connection: Connection | null = null;

/**
 * Connect to MongoDB using Mongoose
 * Implements single connection pattern to avoid multiple connections
 */
export const connectDatabase = async (): Promise<Connection> => {
  // Return existing connection if already established
  if (connection) {
    console.log("📦 Using existing MongoDB connection");
    return connection;
  }

  try {
    console.log("🔌 Connecting to MongoDB...");

    const mongooseConnection = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connection = mongooseConnection.connection;

    console.log(
      `✅ MongoDB connected successfully to: ${env.mongoUri.split("@")[1] || "local instance"}`
    );

    // Handle connection events
    connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      connection = null;
    });

    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    connection = null;
    throw new Error(
      `Failed to connect to MongoDB: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Gracefully disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (!connection) {
    console.log("ℹ️ MongoDB connection not established");
    return;
  }

  try {
    await mongoose.disconnect();
    connection = null;
    console.log("✅ MongoDB disconnected successfully");
  } catch (error) {
    console.error("❌ MongoDB disconnection error:", error);
    throw error;
  }
};

/**
 * Get current MongoDB connection status
 */
export const isDatabaseConnected = (): boolean => {
  return connection !== null && mongoose.connection.readyState === 1;
};

/**
 * Health check for database connectivity
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!connection) {
      return false;
    }

    // Execute a simple ping command to verify connection
    const admin = connection.getClient().db().admin();
    await admin.ping();
    return true;
  } catch (error) {
    console.error("💔 Database health check failed:", error);
    return false;
  }
};
