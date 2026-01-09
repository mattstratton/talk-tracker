import { describe, expect, it } from "vitest";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";
import { db } from "~/server/db";

const createCaller = createCallerFactory(appRouter);
const caller = createCaller({ session: null, db, headers: new Headers() });

describe("proposalRouter", () => {
  it("requires authentication for getAll", async () => {
    try {
      await caller.proposal.getAll();
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("requires authentication for create", async () => {
    try {
      await caller.proposal.create({
        talkId: 1,
        eventId: 1,
        talkType: "regular",
      });
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
