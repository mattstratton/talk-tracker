import { execSync } from "node:child_process";
import { config } from "dotenv";

export default async function setup() {
  // Load test environment variables
  config({ path: ".env.test.local" });

  console.log("Pushing schema to test database...");

  try {
    // Push schema to test database
    execSync("npm run db:push", {
      stdio: "inherit",
      env: {
        ...process.env,
        // Override with test database settings
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_SCHEMA: process.env.DATABASE_SCHEMA,
      },
    });
    console.log("Test database schema ready!");
  } catch (error) {
    console.error("Failed to push schema to test database:", error);
    throw error;
  }
}
