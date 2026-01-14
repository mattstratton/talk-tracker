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
    startDate: date("start_date"),
    endDate: date("end_date"),
    location: text("location"),
    description: text("description"),
    cfpDeadline: date("cfp_deadline"),
    cfpUrl: text("cfp_url"),
    conferenceWebsite: text("conference_website"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [
    index("event_name_idx").on(t.name),
    index("event_start_date_idx").on(t.startDate),
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

// Scoring Categories table (Six Sigma matrix categories)
export const scoringCategories = createTable(
  "scoring_category",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    name: text("name").notNull(),
    weight: integer("weight").notNull().unique(),
    displayOrder: integer("display_order").notNull(),
    score9Description: text("score_9_description").notNull(),
    score3Description: text("score_3_description").notNull(),
    score1Description: text("score_1_description").notNull(),
    score0Description: text("score_0_description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [index("scoring_category_display_order_idx").on(t.displayOrder)],
);

// Event Scores table (scores for events using the scoring matrix)
export const eventScores = createTable(
  "event_score",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => scoringCategories.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => ({
    eventScoreEventIdx: index("event_score_event_idx").on(t.eventId),
    eventScoreCategoryIdx: index("event_score_category_idx").on(t.categoryId),
  }),
);

// App Settings table (global configuration key-value store)
export const appSettings = createTable(
  "app_setting",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [index("app_setting_key_idx").on(t.key)],
);

// Talk Tags table (tag definitions for categorizing talks)
export const talkTags = createTable(
  "talk_tag",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    name: text("name").notNull().unique(),
    color: text("color"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [index("talk_tag_name_idx").on(t.name)],
);

// Talk Tag Assignments table (many-to-many join table for talks and tags)
export const talkTagAssignments = createTable(
  "talk_tag_assignment",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    talkId: integer("talk_id")
      .notNull()
      .references(() => talks.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => talkTags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("talk_tag_assignment_talk_idx").on(t.talkId),
    index("talk_tag_assignment_tag_idx").on(t.tagId),
  ],
);

// Activity tracking for comments and status changes
// Can be attached to proposals, events, or talks (exactly one must be set)
export const activities = createTable(
  "activity",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    // Entity references (exactly one must be set)
    proposalId: integer("proposal_id").references(() => proposals.id, {
      onDelete: "cascade",
    }),
    eventId: integer("event_id").references(() => events.id, {
      onDelete: "cascade",
    }),
    talkId: integer("talk_id").references(() => talks.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activityType: text("activity_type", {
      enum: ["comment", "status_change"],
    }).notNull(),
    // For comments
    content: text(),
    isEdited: boolean("is_edited").default(false).notNull(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    // For status changes (only applicable to proposals)
    oldStatus: text("old_status", {
      enum: ["draft", "submitted", "accepted", "rejected", "confirmed"],
    }),
    newStatus: text("new_status", {
      enum: ["draft", "submitted", "accepted", "rejected", "confirmed"],
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [
    index("activity_proposal_idx").on(t.proposalId),
    index("activity_event_idx").on(t.eventId),
    index("activity_talk_idx").on(t.talkId),
    index("activity_user_idx").on(t.userId),
    index("activity_type_idx").on(t.activityType),
    index("activity_created_idx").on(t.createdAt),
  ],
);

// @mentions in comments
export const mentions = createTable(
  "mention",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    activityId: integer("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    mentionedUserId: text("mentioned_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("mention_activity_idx").on(t.activityId),
    index("mention_user_idx").on(t.mentionedUserId),
  ],
);

// Notifications table
export const notifications = createTable(
  "notification",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    notificationType: text("notification_type", {
      enum: ["mention", "status_change", "comment", "cfp_deadline"],
    }).notNull(),
    // Entity references (at most one should be set)
    activityId: integer("activity_id").references(() => activities.id, {
      onDelete: "cascade",
    }),
    eventId: integer("event_id").references(() => events.id, {
      onDelete: "cascade",
    }),
    // Denormalized content (remains readable even if source deleted)
    title: text("title").notNull(),
    message: text("message").notNull(),
    linkUrl: text("link_url").notNull(),
    // Actor (null for system-generated like CFP deadlines)
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // State
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    // Future email/Slack support
    deliveryMethod: text("delivery_method", {
      enum: ["in_app", "email", "slack"],
    })
      .default("in_app")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("notification_user_idx").on(t.userId),
    index("notification_read_idx").on(t.isRead),
    index("notification_type_idx").on(t.notificationType),
    index("notification_created_idx").on(t.createdAt),
    index("notification_activity_idx").on(t.activityId),
    index("notification_event_idx").on(t.eventId),
  ],
);

// Notification Preferences table
export const notificationPreferences = createTable(
  "notification_preference",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    // In-app preferences (enabled by default)
    mentionsEnabled: boolean("mentions_enabled").default(true).notNull(),
    statusChangesEnabled: boolean("status_changes_enabled")
      .default(true)
      .notNull(),
    commentsEnabled: boolean("comments_enabled").default(true).notNull(),
    cfpDeadlinesEnabled: boolean("cfp_deadlines_enabled")
      .default(true)
      .notNull(),
    cfpDeadlineDaysBefore: integer("cfp_deadline_days_before")
      .default(7)
      .notNull(),
    // Future: email preferences (disabled by default)
    emailMentionsEnabled: boolean("email_mentions_enabled")
      .default(false)
      .notNull(),
    emailStatusChangesEnabled: boolean("email_status_changes_enabled")
      .default(false)
      .notNull(),
    emailCommentsEnabled: boolean("email_comments_enabled")
      .default(false)
      .notNull(),
    emailCfpDeadlinesEnabled: boolean("email_cfp_deadlines_enabled")
      .default(false)
      .notNull(),
    // Future: Slack preferences (disabled by default)
    slackMentionsEnabled: boolean("slack_mentions_enabled")
      .default(false)
      .notNull(),
    slackStatusChangesEnabled: boolean("slack_status_changes_enabled")
      .default(false)
      .notNull(),
    slackCommentsEnabled: boolean("slack_comments_enabled")
      .default(false)
      .notNull(),
    slackCfpDeadlinesEnabled: boolean("slack_cfp_deadlines_enabled")
      .default(false)
      .notNull(),
    slackWebhookUrl: text("slack_webhook_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [index("notification_preference_user_idx").on(t.userId)],
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
export const userRelations = relations(user, ({ one, many }) => ({
  account: many(account),
  session: many(session),
  talks: many(talks),
  proposals: many(proposals),
  activities: many(activities),
  mentions: many(mentions),
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  proposals: many(proposals),
  scores: many(eventScores),
  activities: many(activities),
  notifications: many(notifications),
  participations: many(eventParticipations),
}));

export const talksRelations = relations(talks, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [talks.createdById],
    references: [user.id],
  }),
  proposals: many(proposals),
  talkTagAssignments: many(talkTagAssignments),
  activities: many(activities),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
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
  activities: many(activities),
}));

export const scoringCategoriesRelations = relations(
  scoringCategories,
  ({ many }) => ({
    eventScores: many(eventScores),
  }),
);

export const eventScoresRelations = relations(eventScores, ({ one }) => ({
  event: one(events, {
    fields: [eventScores.eventId],
    references: [events.id],
  }),
  category: one(scoringCategories, {
    fields: [eventScores.categoryId],
    references: [scoringCategories.id],
  }),
}));

export const talkTagsRelations = relations(talkTags, ({ many }) => ({
  talkTagAssignments: many(talkTagAssignments),
}));

export const talkTagAssignmentsRelations = relations(
  talkTagAssignments,
  ({ one }) => ({
    talk: one(talks, {
      fields: [talkTagAssignments.talkId],
      references: [talks.id],
    }),
    tag: one(talkTags, {
      fields: [talkTagAssignments.tagId],
      references: [talkTags.id],
    }),
  }),
);

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  proposal: one(proposals, {
    fields: [activities.proposalId],
    references: [proposals.id],
  }),
  event: one(events, {
    fields: [activities.eventId],
    references: [events.id],
  }),
  talk: one(talks, {
    fields: [activities.talkId],
    references: [talks.id],
  }),
  user: one(user, {
    fields: [activities.userId],
    references: [user.id],
  }),
  mentions: many(mentions),
}));

export const mentionsRelations = relations(mentions, ({ one }) => ({
  activity: one(activities, {
    fields: [mentions.activityId],
    references: [activities.id],
  }),
  mentionedUser: one(user, {
    fields: [mentions.mentionedUserId],
    references: [user.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
  actor: one(user, {
    fields: [notifications.actorId],
    references: [user.id],
  }),
  activity: one(activities, {
    fields: [notifications.activityId],
    references: [activities.id],
  }),
  event: one(events, {
    fields: [notifications.eventId],
    references: [events.id],
  }),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationPreferences.userId],
      references: [user.id],
    }),
  }),
);

// Event participation tracking
export const eventParticipations = createTable(
  "event_participation",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    participationType: text("participation_type", {
      enum: ["speak", "sponsor", "attend", "exhibit", "volunteer"],
    }).notNull(),
    status: text("status", {
      enum: ["interested", "confirmed", "not_going"],
    })
      .notNull()
      .default("interested"),
    // Detailed planning fields
    budget: integer("budget"), // Budget/cost in cents
    sponsorshipTier: text("sponsorship_tier"), // e.g., "Gold", "Silver", "Bronze"
    boothSize: text("booth_size"), // e.g., "10x10", "20x20"
    details: text("details"), // General details field
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [
    index("event_participation_event_idx").on(t.eventId),
    index("event_participation_type_idx").on(t.participationType),
  ],
);

export const eventParticipationsRelations = relations(
  eventParticipations,
  ({ one }) => ({
    event: one(events, {
      fields: [eventParticipations.eventId],
      references: [events.id],
    }),
  }),
);
