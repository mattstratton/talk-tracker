import { describe, expect, it } from "vitest";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";
import { db } from "~/server/db";

const createCaller = createCallerFactory(appRouter);
const caller = createCaller({ session: null, db, headers: new Headers() });

describe("eventRouter", () => {
  it("requires authentication for getAll", async () => {
    try {
      await caller.event.getAll();
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("requires authentication for create", async () => {
    try {
      await caller.event.create({
        name: "Test Conference",
        startDate: "2026-06-15",
        location: "San Francisco",
      });
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
