// #region imports
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  boolean,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
// #endregion

// #region auth
const Role = ["user", "moderator", "admin"] as const;
export type RoleEnum = (typeof Role)[number];
export const roles = pgEnum("roles", Role);

export const users = pgTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
  phone: varchar("phone", { length: 64 }),
  password: varchar("password", { length: 64 }),
  role: roles("role").default("user").notNull(),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  subscriptions: many(subscriptions),
}));

export const accounts = pgTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable("verification_token", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const resetPasswordTokens = pgTable("reset_password_token", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});
// #endregion

// #region courses
export const courses = pgTable("course", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 256 }),
  slug: varchar("slug", { length: 35 }).notNull().unique(),
  description: text("description"),
  stripePrice: integer("stripe_price").default(0),
  stripeProductId: varchar("stripe_product_id"),
  stripePriceId: varchar("stripe_price_id"),
  ownerId: varchar("owner_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const coursesRelations = relations(courses, ({ many, one }) => ({
  lessons: many(lessons),
  teacher: one(users, { fields: [courses.ownerId], references: [users.id] }),
  subscriptions: many(subscriptions),
}));
// #endregion

// #region subscriptions
export const subscriptions = pgTable("subscription", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: varchar("course_id", { length: 255 })
    .notNull()
    .references(() => courses.id),
  studentId: varchar("student_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  active: boolean("active").default(true),
  paid: boolean("paid").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const subscriptionsRelations = relations(
  subscriptions,
  ({ many, one }) => ({
    course: one(courses, {
      fields: [subscriptions.courseId],
      references: [courses.id],
    }),
    student: one(users, {
      fields: [subscriptions.studentId],
      references: [users.id],
    }),
    reviews: many(reviews),
  }),
);
// #endregion

// #region lessons
export const lessons = pgTable("lesson", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  newDate: timestamp("new_date", { withTimezone: true }),
  link: varchar("link"),
  courseId: varchar("course_id", { length: 255 }).references(() => courses.id),
  video: varchar("video", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  mission: one(missions),
  lessonAssistances: many(lessonAssistances),
}));
// #endregion

// #region lessons assistances
export const lessonAssistances = pgTable("lesson_assistances", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lessonId: varchar("lessonId", { length: 255 })
    .notNull()
    .references(() => lessons.id),
  assisted: boolean("assisted"),
  studentId: varchar("studentId", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const lessonsAssistancesRelations = relations(
  lessonAssistances,
  ({ one }) => ({
    student: one(users, {
      fields: [lessonAssistances.studentId],
      references: [users.id],
    }),
    lesson: one(lessons, {
      fields: [lessonAssistances.lessonId],
      references: [lessons.id],
    }),
  }),
);
// #endregion

// #region missions
export const missions = pgTable("mission", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar("title", { length: 256 }),
  instructions: text("instructions"),
  lessonId: varchar("lesson_id", { length: 255 })
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const missionsRelations = relations(missions, ({ many, one }) => ({
  lesson: one(lessons, {
    fields: [missions.lessonId],
    references: [lessons.id],
  }),
  reviews: many(reviews),
}));
// #endregion

// #region reviews
export const reviews = pgTable("review", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  missionId: varchar("mission_id", { length: 255 })
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id", { length: 255 })
    .notNull()
    .references(() => subscriptions.id),
  extension: timestamp("extension", { withTimezone: true }),
  teacherReview: text("teacher_review"),
  score: integer("score"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const reviewsRelations = relations(reviews, ({ many, one }) => ({
  subscription: one(subscriptions, {
    fields: [reviews.subscriptionId],
    references: [subscriptions.id],
  }),
  mission: one(missions, {
    fields: [reviews.missionId],
    references: [missions.id],
  }),
  attachments: many(reviewDocuments),
  message: many(messages),
}));
// #endregion

// #region review documents
export const reviewDocuments = pgTable("review_document", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 255 }).notNull(),
  reviewId: varchar("review_id", { length: 255 }).references(() => reviews.id, {
    onDelete: "cascade",
  }),
  solution: boolean("solution").default(false),
  uploadedBy: varchar("uploaded_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const reviewDocumentsRelations = relations(
  reviewDocuments,
  ({ one }) => ({
    review: one(reviews, {
      fields: [reviewDocuments.reviewId],
      references: [reviews.id],
    }),
    createdBy: one(users, {
      fields: [reviewDocuments.uploadedBy],
      references: [users.id],
    }),
  }),
);
// #endregion

// #region messages
export const messages = pgTable("message", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reviewId: varchar("review_id", { length: 255 }).references(() => reviews.id, {
    onDelete: "cascade",
  }),
  senderId: varchar("sender_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  attachedFiles: text("attached_files").array(),
  content: text("content"),
  deleted: boolean("deleted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  author: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  review: one(reviews, {
    fields: [messages.reviewId],
    references: [reviews.id],
  }),
}));
// #endregion

// #region notifications
const NotificationTypes = [
  "missionMessage",
  "missionUpdate",
  "reviewScore",
  "reviewExtension",
  "subscriptionUpdate",
] as const;
export type NotificationTypeEnum = (typeof NotificationTypes)[number];
export const notificationTypes = pgEnum("notificationTypes", NotificationTypes);

export const notifications = pgTable("notification", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: notificationTypes("type").notNull(),
  isRead: boolean("is_read").default(false),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  resourceId: varchar("resource_id", { length: 255 }),
  content: text("content"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
// #endregion
