import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

/**
 * Start server and initialize all services
 * Handles graceful startup with proper error handling
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    const server = app.listen(env.port, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 AI Smart Task Manager Backend    ║
║                                        ║
║   Environment: ${env.nodeEnv.padEnd(25)} ║
║   Port: ${env.port.toString().padEnd(30)} ║
║   Status: Running                      ║
╚════════════════════════════════════════╝
      `);
    });

    /**
     * Graceful Shutdown Handler
     * Cleanup resources on application termination
     */
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n⚠️  Received ${signal} signal, shutting down gracefully...`);

      server.close(async () => {
        console.log("✅ HTTP server closed");

        try {
          await disconnectDatabase();
          console.log("✅ Database connection closed");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during shutdown:", error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 30000);
    };

    // Handle termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    /**
     * Unhandled Promise Rejection Handler
     */
    process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
      console.error("⚠️  Unhandled Rejection at:", promise, "reason:", reason);
    });

    /**
     * Uncaught Exception Handler
     */
    process.on("uncaughtException", (error: Error) => {
      console.error("⚠️  Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
