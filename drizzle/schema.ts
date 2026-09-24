import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const events = mysqlTable(
  "events",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 180 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    category: mysqlEnum("category", ["Concerts", "Sports", "Theater", "Comedy", "Festivals", "Family", "Experiences"])
      .notNull(),
    artist: varchar("artist", { length: 255 }).notNull(),
    startsAt: timestamp("startsAt").notNull(),
    venue: varchar("venue", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    description: text("description").notNull(),
    imageKey: varchar("imageKey", { length: 32 }).notNull(),
    verificationStatus: mysqlEnum("verificationStatus", ["VERIFIED", "VERIFICATION PENDING", "UNVERIFIED"]).default("UNVERIFIED").notNull(),
    officialSourceUrl: varchar("officialSourceUrl", { length: 500 }),
    address: varchar("address", { length: 255 }),
    isVeloraPick: boolean("isVeloraPick").default(false).notNull(),
    isTrending: boolean("isTrending").default(false).notNull(),
    isPublished: boolean("isPublished").default(true).notNull(),
    isDemo: boolean("isDemo").default(true).notNull(),
    status: mysqlEnum("status", ["DRAFT", "PUBLISHED", "UNPUBLISHED", "CANCELLED"]).default("PUBLISHED").notNull(),
    deliveryMethod: varchar("deliveryMethod", { length: 100 }).default("Digital delivery").notNull(),
    externalSource: varchar("externalSource", { length: 255 }),
    terms: text("terms"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("events_slug_unique").on(table.slug), index("events_city_category_idx").on(table.city, table.category)],
);

export const inventory = mysqlTable(
  "inventory",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: int("eventId").notNull(),
    source: varchar("source", { length: 255 }).notNull(),
    purchaseDate: timestamp("purchaseDate"),
    acquisitionCost: decimal("acquisitionCost", { precision: 10, scale: 2 }).notNull(),
    purchaseFees: decimal("purchaseFees", { precision: 10, scale: 2 }).default("0").notNull(),
    section: varchar("section", { length: 80 }).notNull(),
    row: varchar("row", { length: 80 }).notNull(),
    seat: varchar("seat", { length: 120 }).notNull(),
    quantity: int("quantity").notNull(),
    comparableMarketPrice: decimal("comparableMarketPrice", { precision: 10, scale: 2 }),
    sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }),
    serviceFee: decimal("serviceFee", { precision: 10, scale: 2 }).default("0").notNull(),
    taxes: decimal("taxes", { precision: 10, scale: 2 }).default("0").notNull(),
    desiredMargin: decimal("desiredMargin", { precision: 10, scale: 2 }).default("0").notNull(),
    label: varchar("label", { length: 64 }),
    transferMethod: varchar("transferMethod", { length: 100 }).default("Digital delivery").notNull(),
    verificationStatus: mysqlEnum("verificationStatus", ["VERIFIED", "VERIFICATION PENDING", "UNVERIFIED"]).default("UNVERIFIED").notNull(),
    ticketUrl: varchar("ticketUrl", { length: 500 }),
    ticketStatus: mysqlEnum("ticketStatus", ["AVAILABLE", "RESERVED", "SOLD", "PENDING TRANSFER", "DELIVERED", "CANCELLED"])
      .default("AVAILABLE")
      .notNull(),
    transferStatus: mysqlEnum("transferStatus", ["NOT_READY", "READY", "PENDING", "COMPLETED", "FAILED"])
      .default("NOT_READY")
      .notNull(),
    pricingReviewRequired: boolean("pricingReviewRequired").default(false).notNull(),
    isDemo: boolean("isDemo").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("inventory_event_status_idx").on(table.eventId, table.ticketStatus)],
);

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    orderNumber: varchar("orderNumber", { length: 40 }).notNull(),
    userId: int("userId"),
    email: varchar("email", { length: 320 }).notNull(),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    eventId: int("eventId").notNull(),
    inventoryId: int("inventoryId").notNull(),
    quantity: int("quantity").notNull(),
    ticketSubtotal: decimal("ticketSubtotal", { precision: 10, scale: 2 }).notNull(),
    serviceFee: decimal("serviceFee", { precision: 10, scale: 2 }).notNull(),
    taxes: decimal("taxes", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: mysqlEnum("paymentStatus", ["PENDING", "PAID", "FAILED", "REFUNDED", "DEMO_PAID"]).default("PENDING").notNull(),
    deliveryStatus: mysqlEnum("deliveryStatus", ["PENDING", "PROCESSING", "DELIVERED", "DEMO_READY", "CANCELLED"]).default("PENDING").notNull(),
    isDemo: boolean("isDemo").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("orders_number_unique").on(table.orderNumber), index("orders_user_created_idx").on(table.userId, table.createdAt)],
);

export const savedEvents = mysqlTable(
  "saved_events",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    eventId: int("eventId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("saved_events_user_event_unique").on(table.userId, table.eventId)],
);

export const emailSubscribers = mysqlTable(
  "email_subscribers",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    status: mysqlEnum("status", ["ACTIVE", "UNSUBSCRIBED"]).default("ACTIVE").notNull(),
    source: varchar("source", { length: 80 }).default("homepage").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("email_subscribers_email_unique").on(table.email)],
);

export const contentArticles = mysqlTable(
  "content_articles",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 180 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    sourceSummary: text("sourceSummary").notNull(),
    imageKey: varchar("imageKey", { length: 32 }).default("hero").notNull(),
    seoTitle: varchar("seoTitle", { length: 255 }).notNull(),
    metaDescription: varchar("metaDescription", { length: 320 }).notNull(),
    keywords: json("keywords").$type<string[]>().notNull(),
    faq: json("faq").$type<Array<{ question: string; answer: string }>>().notNull(),
    relatedEventIds: json("relatedEventIds").$type<number[]>().notNull(),
    status: mysqlEnum("status", ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED", "NEEDS_REVIEW"]).default("DRAFT").notNull(),
    isDemo: boolean("isDemo").default(true).notNull(),
    publishedAt: timestamp("publishedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("content_articles_slug_unique").on(table.slug), index("content_articles_status_published_idx").on(table.status, table.publishedAt)],
);

export const contentAutomation = mysqlTable("content_automation", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  autoPublish: boolean("autoPublish").default(true).notNull(),
  cronExpression: varchar("cronExpression", { length: 100 }).default("0 0 14 * * *").notNull(),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  catalogSyncEnabled: boolean("catalogSyncEnabled").default(false).notNull(),
  catalogSyncTaskUid: varchar("catalogSyncTaskUid", { length: 65 }),
  catalogLastRunAt: timestamp("catalogLastRunAt"),
  catalogLastStatus: varchar("catalogLastStatus", { length: 255 }).default("Provider not configured").notNull(),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  lastStatus: varchar("lastStatus", { length: 80 }).default("Not scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const chatbotConversations = mysqlTable(
  "chatbot_conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    anonymousId: varchar("anonymousId", { length: 100 }),
    topic: varchar("topic", { length: 80 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("chatbot_conversations_user_idx").on(table.userId, table.updatedAt)],
);

export const chatbotMessages = mysqlTable(
  "chatbot_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    role: mysqlEnum("role", ["user", "assistant"]).notNull(),
    content: text("content").notNull(),
    eventIds: json("eventIds").$type<number[]>().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("chatbot_messages_conversation_idx").on(table.conversationId, table.createdAt)],
);

export const seoOpportunities = mysqlTable("seo_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  intent: varchar("intent", { length: 100 }).notNull(),
  targetType: varchar("targetType", { length: 80 }).notNull(),
  targetSlug: varchar("targetSlug", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["NEW", "IN_PROGRESS", "PUBLISHED", "MONITORING"]).default("NEW").notNull(),
  source: varchar("source", { length: 100 }).default("Catalog-derived").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const analyticsSnapshots = mysqlTable("analytics_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  recordedOn: varchar("recordedOn", { length: 10 }).notNull(),
  sessions: int("sessions").default(0).notNull(),
  organicSessions: int("organicSessions").default(0).notNull(),
  orders: int("orders").default(0).notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  contentViews: int("contentViews").default(0).notNull(),
  indexedPages: int("indexedPages").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull(),
  settingValue: varchar("settingValue", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InventoryItem = typeof inventory.$inferSelect;
export type ContentArticle = typeof contentArticles.$inferSelect;
