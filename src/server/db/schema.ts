import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgSchema,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { env } from "~/env";

export const dbSchema = pgSchema(env.DATABASE_SCHEMA);
const createTable = dbSchema.table;

// Events/Conferences table
export const events = createTable(
  "event",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    name: text("name").notNull(),
    date: date("date"),
    location: text("location"),
    description: text("description"),
    cfpDeadline: date("cfp_deadline"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [
    index("event_name_idx").on(t.name),
    index("event_date_idx").on(t.date),
  ],
);

// Talks library table
export const talks = createTable(
  "talk",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    title: text("title").notNull(),
    abstract: text("abstract").notNull(),
    description: text("description"),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [
    index("talk_created_by_idx").on(t.createdById),
    index("talk_title_idx").on(t.title),
  ],
);

// Proposals table
export const proposals = createTable(
  "proposal",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    talkId: integer("talk_id")
      .notNull()
      .references(() => talks.id, { onDelete: "cascade" }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    status: text("status", {
      enum: ["draft", "submitted", "accepted", "rejected", "confirmed"],
    })
      .notNull()
      .default("draft"),
    talkType: text("talk_type", {
      enum: ["keynote", "regular", "lightning", "workshop"],
    }).notNull(),
    submissionDate: date("submission_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [
    index("proposal_talk_idx").on(t.talkId),
    index("proposal_event_idx").on(t.eventId),
    index("proposal_user_idx").on(t.userId),
    index("proposal_status_idx").on(t.status),
  ],
);

// Better Auth tables
export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = createTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = createTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  talks: many(talks),
  proposals: many(proposals),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  proposals: many(proposals),
}));

export const talksRelations = relations(talks, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [talks.createdById],
    references: [user.id],
  }),
  proposals: many(proposals),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  talk: one(talks, {
    fields: [proposals.talkId],
    references: [talks.id],
  }),
  event: one(events, {
    fields: [proposals.eventId],
    references: [events.id],
  }),
  user: one(user, {
    fields: [proposals.userId],
    references: [user.id],
  }),
}));
