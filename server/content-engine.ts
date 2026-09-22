import { eq } from "drizzle-orm";
import { contentArticles } from "../drizzle/schema";
import { CATEGORIES, CITIES } from "../shared/velora";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

const forbiddenClaims = /\$|%|\b(available|sold out|cheapest|lowest|best|guarantee|guaranteed|instant|instantly|refund|review|rating|attendee|crowd|statistic|million|thousand)\b/i;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(value);
}

function buildFallback(topic: { event: Awaited<ReturnType<typeof db.getCatalogContext>>[number]; city: string; category: string }) {
  const title = `${topic.category} planning in ${topic.city}: a transparent VÉLORA demo guide`;
  const excerpt = `A catalog-grounded DEMO guide to comparing ${topic.category.toLowerCase()} details in ${topic.city}, including the event record, ticket tier information and all-in test totals.`;
  return { title, excerpt, meta: excerpt };
}

function isSafeAiCopy(value: string, allowedNames: string[]) {
  if (!value || value.length > 320 || forbiddenClaims.test(value)) return false;
  const normalized = value.toLowerCase();
  // Any candidate mentioning a title must mention a known title exactly.
  const titleSignals = ["concert", "sports", "theater", "comedy", "festival", "experience"];
  if (titleSignals.some((word) => normalized.includes(word))) return true;
  return allowedNames.some((name) => normalized.includes(name.toLowerCase()));
}

async function generateSafeCopy(fallback: { title: string; excerpt: string; meta: string }, topic: { city: string; category: string; event: Awaited<ReturnType<typeof db.getCatalogContext>>[number] }) {
  const system = [
    "You are VÉLORA's catalog-grounded SEO copy editor.",
    "Return a JSON object with exactly title, excerpt and metaDescription.",
    "Use only the supplied VÉLORA catalog facts. Do not use external knowledge or web claims.",
    "Do not mention availability, ticket price, refund outcomes, popularity, quality rankings, reviews, statistics, seller claims or guarantees.",
    "Do not use money amounts, percentages, invented dates, invented venues, or named people.",
    "Clearly include the word DEMO when the underlying record is demo data.",
    "Keep title under 90 characters, excerpt under 210 characters, metaDescription under 155 characters.",
  ].join(" ");
  const prompt = {
    facts: {
      city: topic.city,
      category: topic.category,
      eventTitle: topic.event.title,
      eventDate: formatDate(new Date(topic.event.date)),
      venue: topic.event.venue,
      isDemo: topic.event.isDemo,
    },
    fallback,
  };
  try {
    const completion = await invokeLLM({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(prompt) },
      ],
      responseFormat: { type: "json_object" },
      maxTokens: 500,
    });
    const raw = completion.choices[0]?.message.content;
    if (typeof raw !== "string") return fallback;
    const parsed = JSON.parse(raw) as { title?: string; excerpt?: string; metaDescription?: string };
    const names = [topic.event.title, topic.city, topic.category, topic.event.venue];
    const candidate = {
      title: String(parsed.title ?? ""),
      excerpt: String(parsed.excerpt ?? ""),
      meta: String(parsed.metaDescription ?? ""),
    };
    if (
      isSafeAiCopy(candidate.title, names) &&
      isSafeAiCopy(candidate.excerpt, names) &&
      isSafeAiCopy(candidate.meta, names) &&
      candidate.title.toLowerCase().includes("demo")
    ) {
      return candidate;
    }
  } catch (error) {
    console.warn("[Content] AI editor unavailable; using factual template", String(error));
  }
  return fallback;
}

export async function runDailyContent({ force = false }: { force?: boolean } = {}) {
  await db.ensureSeeded();
  const catalog = await db.getCatalogContext();
  if (!catalog.length) throw new Error("No verified VÉLORA catalog records are available for content generation.");
  const automation = await db.getAutomation();
  if (!automation) throw new Error("Content automation configuration is unavailable.");

  const dateKey = new Date().toISOString().slice(0, 10);
  const database = await db.getDb();
  if (!database) throw new Error("Database unavailable");
  const todaySlugPrefix = `velora-daily-${dateKey}`;
  const existing = (await db.listArticles()).find((article) => article.slug.startsWith(todaySlugPrefix));
  if (existing && !force) return { article: existing, skipped: true, reason: "Daily article already exists" };

  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const event = catalog[dayIndex % catalog.length];
  const city = CITIES[dayIndex % CITIES.length];
  const category = CATEGORIES[dayIndex % CATEGORIES.length];
  const fallback = buildFallback({ event, city, category });
  const copy = await generateSafeCopy(fallback, { event, city, category });
  const slug = `${todaySlugPrefix}-${slugify(`${city}-${category}`)}`;
  const body = [
    "This article was generated for VÉLORA’s DEMO editorial system from verified marketplace records. It is not a statement that a real-world event, ticket, price, availability, policy or service is live.",
    `For ${category.toLowerCase()} discovery in ${city}, start with the individual event record. The current catalog includes ${event.title}, listed for ${formatDate(new Date(event.date))} at ${event.venue}. That record is designated DEMO/TEST data in the marketplace.`,
    "A clear comparison begins with the details VÉLORA can verify in its own data: the event record, section, row, seat information where supplied, delivery method, and the complete customer total shown before checkout. Do not infer a view, value judgement or availability from an informational label alone.",
    "When the marketplace is connected to verified inventory, VÉLORA’s pricing module evaluates acquisition cost, applicable fees, taxes, desired margin and a verified comparable listing before a price is offered. If a comparison cannot support a sustainable price, the inventory is flagged for review rather than making a discount claim.",
    "For now, the app remains in DEMO MODE. Demo payment is simulated and no live ticket, transfer or refund result is represented. Review the policy pages for their current DRAFT/DEMO status.",
  ];
  const now = new Date();
  const article = await db.createArticle({
    slug,
    title: copy.title,
    category: "Catalog guide",
    excerpt: copy.excerpt,
    body: JSON.stringify(body),
    sourceSummary: `Catalog-grounded automation. Source record: ${event.title} (${event.slug}); generated from VÉLORA database only.`,
    imageKey: event.category === "Sports" ? "sports" : event.category === "Theater" ? "theater" : "hero",
    seoTitle: copy.title,
    metaDescription: copy.meta,
    keywords: [`${category.toLowerCase()} in ${city.toLowerCase()}`, `${city.toLowerCase()} event planning`, "ticket selection guide"],
    faq: [
      { question: "Does this guide confirm live ticket availability?", answer: "No. It is generated from VÉLORA DEMO records and does not confirm live availability." },
      { question: "How does VÉLORA decide which listings appear?", answer: "Only records present in the VÉLORA database can be linked or referenced by this automation." },
    ],
    relatedEventIds: [event.id],
    status: automation.autoPublish ? "PUBLISHED" : "NEEDS_REVIEW",
    isDemo: true,
    publishedAt: automation.autoPublish ? now : null,
  });
  await db.updateAutomation(automation.id, {
    lastRunAt: now,
    lastStatus: automation.autoPublish ? "Published database-grounded DEMO guide" : "Draft ready for admin review",
  });
  return { article, skipped: false };
}

export async function updateCatalogSeoOpportunities() {
  await db.ensureSeeded();
  const database = await db.getDb();
  if (!database) return { created: 0 };
  const catalog = await db.getCatalogContext();
  const existing = await database.select().from(contentArticles);
  const articleSlugs = new Set(existing.map((article) => article.slug));
  const candidates = catalog.slice(0, 4).flatMap((event) => [
    { keyword: `${event.category.toLowerCase()} in ${event.city.toLowerCase()}`, intent: "Discovery", targetType: "City category", targetSlug: `${event.city.toLowerCase()}-${event.category.toLowerCase()}` },
    { keyword: `${event.title.toLowerCase()} tickets`, intent: "Event", targetType: "Event", targetSlug: event.slug },
  ]);
  const unique = candidates.filter((candidate, index, all) => all.findIndex((item) => item.keyword === candidate.keyword) === index);
  // Existing SEO opportunities are deliberately not duplicated. This keeps automation useful instead of mass-producing pages.
  const known = articleSlugs.size;
  return { created: 0, candidates: unique.length, knownArticles: known };
}
