import { and, asc, count, desc, eq, gte, inArray, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analyticsSnapshots,
  chatbotConversations,
  chatbotMessages,
  contentArticles,
  contentAutomation,
  emailSubscribers,
  events,
  inventory,
  orders,
  savedEvents,
  seoOpportunities,
  siteSettings,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { DEMO_BLOG_POSTS, DEMO_EVENTS, TICKET_TIERS, calculatePricing } from "../shared/velora";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let seedPromise: Promise<void> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

const numberValue = (value: unknown) => (value === null || value === undefined ? 0 : Number(value));

export function calculateInventoryPrice(item: {
  acquisitionCost: unknown;
  purchaseFees: unknown;
  comparableMarketPrice: unknown;
  serviceFee: unknown;
  taxes: unknown;
  desiredMargin: unknown;
}) {
  const acquisitionTotal = numberValue(item.acquisitionCost) + numberValue(item.purchaseFees);
  const comparable = numberValue(item.comparableMarketPrice);
  const minimum = acquisitionTotal + numberValue(item.desiredMargin);
  const marketTarget = comparable > 0 ? comparable - 10 : minimum;
  const reviewRequired = comparable <= 0 || marketTarget < minimum;
  const sellingPrice = reviewRequired ? minimum : marketTarget;
  return {
    sellingPrice,
    serviceFee: numberValue(item.serviceFee),
    taxes: numberValue(item.taxes),
    total: sellingPrice + numberValue(item.serviceFee) + numberValue(item.taxes),
    reviewRequired,
    comparableMarketPrice: comparable,
  };
}

export async function ensureSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const db = await getDb();
    if (!db) return;
    const existing = await db.select({ count: count() }).from(events);
    if (Number(existing[0]?.count ?? 0) > 0) return;

    await db.insert(events).values(
      DEMO_EVENTS.map((event) => ({
        slug: event.slug,
        title: event.title,
        category: event.category,
        artist: event.artist,
        startsAt: new Date(event.date),
        venue: event.venue,
        city: event.city,
        state: event.state,
        description: event.description,
        imageKey: event.imageKey,
        verificationStatus: event.verificationStatus,
        officialSourceUrl: null,
        address: null,
        isVeloraPick: event.isVeloraPick,
        isTrending: event.isTrending,
        isPublished: true,
        isDemo: true,
        status: "PUBLISHED" as const,
        deliveryMethod: "Digital delivery",
        terms: "DEMO/TEST record. Not a live ticket offer.",
      })),
    );

    const seededEvents = await db.select().from(events).orderBy(asc(events.id));
    const inventoryRows = seededEvents.flatMap((event) =>
      TICKET_TIERS.map((tier) => {
        const pricing = calculatePricing(tier);
        return {
          eventId: event.id,
          source: "DEMO / TEST inventory",
          purchaseDate: new Date(),
          acquisitionCost: String(tier.acquisitionCost),
          purchaseFees: String(tier.purchaseFees),
          section: tier.section,
          row: tier.row,
          seat: tier.seats,
          quantity: tier.quantity,
          comparableMarketPrice: String(tier.comparableMarketPrice),
          sellingPrice: String(pricing.sellingPrice),
          serviceFee: String(tier.serviceFee),
          taxes: String(tier.taxes),
          desiredMargin: String(tier.desiredMargin),
          label: tier.label,
          transferMethod: tier.delivery,
          verificationStatus: tier.verificationStatus,
          ticketUrl: null,
          ticketStatus: tier.status === "AVAILABLE" ? ("AVAILABLE" as const) : ("AVAILABLE" as const),
          transferStatus: "NOT_READY" as const,
          pricingReviewRequired: pricing.reviewRequired,
          isDemo: true,
        };
      }),
    );
    await db.insert(inventory).values(inventoryRows);

    await db.insert(contentArticles).values(
      DEMO_BLOG_POSTS.map((post, index) => ({
        slug: post.slug,
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        body: JSON.stringify(post.body),
        sourceSummary: "DEMO editorial content based on VÉLORA sample records and product education. No external events, prices or availability are asserted.",
        imageKey: post.imageKey,
        seoTitle: post.title,
        metaDescription: post.excerpt.slice(0, 300),
        keywords: ["VÉLORA demo", "ticket selection", "Texas events"],
        faq: [
          {
            question: "Is this article based on live availability?",
            answer: "No. This is DEMO content. Check a live event record only when VÉLORA is connected to verified inventory.",
          },
        ],
        relatedEventIds: seededEvents.slice(index, index + 2).map((event) => event.id),
        status: "PUBLISHED" as const,
        isDemo: true,
        publishedAt: new Date(post.updatedAt),
      })),
    );

    await db.insert(contentAutomation).values({
      name: "Daily catalog-grounded content",
      isEnabled: false,
      autoPublish: true,
      cronExpression: "0 0 14 * * *",
      lastStatus: "Ready to schedule after deployment",
    });

    await db.insert(seoOpportunities).values([
      { keyword: "concert seating guide Dallas", intent: "Informational", targetType: "Blog", targetSlug: "best-concert-experiences-dallas-demo", status: "PUBLISHED", source: "Catalog-derived" },
      { keyword: "things to do in Austin this week", intent: "Discovery", targetType: "City", targetSlug: "austin", status: "IN_PROGRESS", source: "Catalog-derived" },
      { keyword: "how to compare ticket prices", intent: "Informational", targetType: "Guide", targetSlug: "guide-to-premium-seating-demo", status: "PUBLISHED", source: "Catalog-derived" },
      { keyword: "Houston event tickets demo", intent: "Transactional", targetType: "City", targetSlug: "houston", status: "NEW", source: "Catalog-derived" },
    ]);

    await db.insert(analyticsSnapshots).values({
      recordedOn: new Date().toISOString().slice(0, 10),
      sessions: 1284,
      organicSessions: 482,
      orders: 12,
      revenue: "1438.00",
      contentViews: 730,
      indexedPages: 18,
    });
    await db.insert(siteSettings).values([{ settingKey: "demoMode", settingValue: "true" }, { settingKey: "seoIndexing", settingValue: "demo-ready" }]);
  })();
  try {
    await seedPromise;
  } finally {
    seedPromise = null;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function listPublicEvents(filters?: { query?: string; category?: string; city?: string; maxPrice?: number }) {
  await ensureSeeded();
  const db = await getDb();
  if (!db) return [];
  const clauses = [eq(events.isPublished, true), eq(events.status, "PUBLISHED")];
  if (filters?.category && filters.category !== "All") clauses.push(eq(events.category, filters.category as typeof events.$inferSelect.category));
  if (filters?.city && filters.city !== "All") clauses.push(eq(events.city, filters.city));
  if (filters?.query) {
    const needle = `%${filters.query}%`;
    clauses.push(or(like(events.title, needle), like(events.artist, needle), like(events.venue, needle), like(events.city, needle))!);
  }
  const rows = await db.select().from(events).where(and(...clauses)).orderBy(asc(events.startsAt));
  const mapped = await Promise.all(
    rows.map(async (event) => {
      const tickets = await db
        .select()
        .from(inventory)
        .where(and(eq(inventory.eventId, event.id), eq(inventory.ticketStatus, "AVAILABLE")));
      const from = tickets
        .map((ticket) => calculateInventoryPrice(ticket).sellingPrice)
        .filter((price) => !filters?.maxPrice || price <= filters.maxPrice!);
      return { ...event, fromPrice: from.length ? Math.min(...from) : null, ticketCount: tickets.length };
    }),
  );
  return mapped.filter((event) => event.fromPrice !== null);
}

export async function getEventDetail(slug: string) {
  await ensureSeeded();
  const db = await getDb();
  if (!db) return null;
  const event = (await db.select().from(events).where(eq(events.slug, slug)).limit(1))[0];
  if (!event) return null;
  const tickets = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.eventId, event.id), eq(inventory.ticketStatus, "AVAILABLE")))
    .orderBy(asc(inventory.sellingPrice));
  const related = await db
    .select()
    .from(events)
    .where(and(eq(events.city, event.city), eq(events.isPublished, true)))
    .orderBy(asc(events.startsAt));
  return {
    event,
    tickets: tickets.map((ticket) => ({ ...ticket, pricing: calculateInventoryPrice(ticket) })),
    related: related.filter((relatedEvent) => relatedEvent.id !== event.id).slice(0, 3),
  };
}

export async function getCatalogContext() {
  const allEvents = await listPublicEvents();
  return allEvents.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    date: event.startsAt.toISOString(),
    venue: event.venue,
    city: event.city,
    category: event.category,
    fromPrice: event.fromPrice,
    isDemo: event.isDemo,
    verificationStatus: event.verificationStatus,
    officialSourceUrl: event.officialSourceUrl,
  }));
}

export async function subscribeEmail(email: string) {
  const db = await getDb();
  if (!db) return { saved: false };
  await db.insert(emailSubscribers).values({ email, source: "homepage" }).onDuplicateKeyUpdate({ set: { status: "ACTIVE" } });
  return { saved: true };
}

export async function saveEventForUser(userId: number, eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(savedEvents).values({ userId, eventId }).onDuplicateKeyUpdate({ set: { userId } });
}

export async function listSavedEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const saved = await db.select().from(savedEvents).where(eq(savedEvents.userId, userId)).orderBy(desc(savedEvents.createdAt));
  if (!saved.length) return [];
  return db.select().from(events).where(inArray(events.id, saved.map((row) => row.eventId)));
}

export async function createDemoOrder(input: { userId?: number; inventoryId: number; quantity: number; customerName: string; email: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const ticket = (await db.select().from(inventory).where(eq(inventory.id, input.inventoryId)).limit(1))[0];
  if (!ticket || ticket.ticketStatus !== "AVAILABLE" || ticket.quantity < input.quantity) {
    throw new Error("This demo ticket is no longer available. Please choose another tier.");
  }
  const event = (await db.select().from(events).where(eq(events.id, ticket.eventId)).limit(1))[0];
  if (!event) throw new Error("Event record not found");
  const price = calculateInventoryPrice(ticket);
  const orderNumber = `VEL-DEMO-${Date.now().toString(36).toUpperCase()}`;
  await db.update(inventory).set({ ticketStatus: "RESERVED", updatedAt: new Date() }).where(eq(inventory.id, ticket.id));
  await db.insert(orders).values({
    orderNumber,
    userId: input.userId,
    email: input.email,
    customerName: input.customerName,
    eventId: event.id,
    inventoryId: ticket.id,
    quantity: input.quantity,
    ticketSubtotal: String(price.sellingPrice * input.quantity),
    serviceFee: String(price.serviceFee * input.quantity),
    taxes: String(price.taxes * input.quantity),
    total: String(price.total * input.quantity),
    paymentStatus: "DEMO_PAID",
    deliveryStatus: "DEMO_READY",
    isDemo: true,
  });
  return { orderNumber, event, ticket, price: { ...price, total: price.total * input.quantity } };
}

export async function listOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAutomation() {
  await ensureSeeded();
  const db = await getDb();
  if (!db) return null;
  return (await db.select().from(contentAutomation).orderBy(asc(contentAutomation.id)).limit(1))[0] ?? null;
}

export async function updateAutomation(id: number, patch: Partial<typeof contentAutomation.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(contentAutomation).set({ ...patch, updatedAt: new Date() }).where(eq(contentAutomation.id, id));
  return getAutomation();
}

export async function listArticles() {
  await ensureSeeded();
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentArticles).orderBy(desc(contentArticles.publishedAt), desc(contentArticles.createdAt));
}

export async function createArticle(article: typeof contentArticles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(contentArticles).values(article);
  return (await db.select().from(contentArticles).where(eq(contentArticles.slug, article.slug)).limit(1))[0];
}

export async function createConversation(userId: number | undefined, anonymousId: string, topic: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(chatbotConversations).values({ userId, anonymousId, topic });
  return Number(result[0].insertId);
}

export async function addChatMessage(conversationId: number, role: "user" | "assistant", content: string, eventIds: number[]) {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatbotMessages).values({ conversationId, role, content, eventIds });
  await db.update(chatbotConversations).set({ updatedAt: new Date() }).where(eq(chatbotConversations.id, conversationId));
}

export async function getAdminSnapshot() {
  await ensureSeeded();
  const db = await getDb();
  if (!db) return null;
  const [eventCount] = await db.select({ value: count() }).from(events);
  const [inventoryCount] = await db.select({ value: count() }).from(inventory);
  const [orderCount] = await db.select({ value: count() }).from(orders);
  const [articleCount] = await db.select({ value: count() }).from(contentArticles);
  const [chatCount] = await db.select({ value: count() }).from(chatbotConversations);
  const [seoCount] = await db.select({ value: count() }).from(seoOpportunities);
  const latest = (await db.select().from(analyticsSnapshots).orderBy(desc(analyticsSnapshots.createdAt)).limit(1))[0];
  const automation = await getAutomation();
  const opportunities = await db.select().from(seoOpportunities).orderBy(desc(seoOpportunities.createdAt));
  const recentArticles = await db.select().from(contentArticles).orderBy(desc(contentArticles.createdAt)).limit(6);
  return {
    metrics: {
      events: Number(eventCount?.value ?? 0),
      inventory: Number(inventoryCount?.value ?? 0),
      orders: Number(orderCount?.value ?? 0),
      content: Number(articleCount?.value ?? 0),
      chats: Number(chatCount?.value ?? 0),
      opportunities: Number(seoCount?.value ?? 0),
      sessions: latest?.sessions ?? 0,
      organicSessions: latest?.organicSessions ?? 0,
      indexedPages: latest?.indexedPages ?? 0,
    },
    automation,
    opportunities,
    recentArticles,
  };
}

export async function updateEventFlags(eventId: number, flags: { isVeloraPick?: boolean; isTrending?: boolean; isPublished?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(events).set({ ...flags, updatedAt: new Date() }).where(eq(events.id, eventId));
}
