import { parse as parseCookie } from "cookie";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { POLICY_FACTS } from "../shared/velora";
import { invokeLLM } from "./_core/llm";
import { createHeartbeatJob, deleteHeartbeatJob, updateHeartbeatJob } from "./_core/heartbeat";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { runDailyContent, updateCatalogSeoOpportunities } from "./content-engine";
import { getCatalogProviderStatus, runCatalogSync } from "./catalog-sync";

const eventFilter = z.object({
  query: z.string().max(120).optional(),
  category: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  maxPrice: z.number().positive().optional(),
});

function assertAdmin(user: { role: string }) {
  if (user.role !== "admin") throw new Error("Admin permission required");
}

function sessionToken(cookie: string | undefined) {
  return parseCookie(cookie ?? "")[COOKIE_NAME] ?? "";
}

function pickReferencedEventIds(message: string, catalog: Awaited<ReturnType<typeof db.getCatalogContext>>) {
  const lower = message.toLowerCase();
  return catalog.filter((event) => lower.includes(event.title.toLowerCase()) || lower.includes(event.city.toLowerCase())).map((event) => event.id);
}

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok", product: "VÉLORA" })),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { httpOnly: true, maxAge: -1, sameSite: "lax", secure: true });
      return { success: true } as const;
    }),
  }),
  marketplace: router({
    events: publicProcedure.input(eventFilter.optional()).query(({ input }) => db.listPublicEvents(input)),
    event: publicProcedure.input(z.object({ slug: z.string().min(1).max(180) })).query(({ input }) => db.getEventDetail(input.slug)),
    subscribe: publicProcedure.input(z.object({ email: z.string().email().max(320) })).mutation(({ input }) => db.subscribeEmail(input.email.toLowerCase())),
    schema: publicProcedure.input(z.object({ slug: z.string().min(1).max(180) })).query(async ({ input }) => {
      const detail = await db.getEventDetail(input.slug);
      if (!detail) return null;
      const { event, tickets } = detail;
      const lowest = tickets.map((ticket) => ticket.pricing.sellingPrice).sort((a, b) => a - b)[0];
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        startDate: event.startsAt.toISOString(),
        location: { "@type": "Place", name: event.venue, address: { "@type": "PostalAddress", addressLocality: event.city, addressRegion: event.state, addressCountry: "US" } },
        description: event.description,
        isAccessibleForFree: false,
        offers: lowest ? { "@type": "Offer", price: lowest, priceCurrency: "USD", availability: "https://schema.org/PreOrder", description: "DEMO/TEST offer only — not live inventory." } : undefined,
        additionalType: "https://schema.org/Product",
      };
    }),
  }),
  account: router({
    saved: protectedProcedure.query(({ ctx }) => db.listSavedEvents(ctx.user.id)),
    save: protectedProcedure.input(z.object({ eventId: z.number().int().positive() })).mutation(({ ctx, input }) => db.saveEventForUser(ctx.user.id, input.eventId)),
    orders: protectedProcedure.query(({ ctx }) => db.listOrdersForUser(ctx.user.id)),
  }),
  checkout: router({
    demoComplete: publicProcedure
      .input(z.object({ inventoryId: z.number().int().positive(), quantity: z.number().int().min(1).max(8), customerName: z.string().min(2).max(255), email: z.string().email().max(320) }))
      .mutation(({ ctx, input }) =>
        db.createDemoOrder({ userId: ctx.user?.id, inventoryId: input.inventoryId, quantity: input.quantity, customerName: input.customerName, email: input.email.toLowerCase() }),
      ),
  }),
  assistant: router({
    ask: publicProcedure
      .input(z.object({ message: z.string().min(1).max(1000), anonymousId: z.string().min(4).max(100), conversationId: z.number().int().positive().optional() }))
      .mutation(async ({ ctx, input }) => {
        const catalog = await db.getCatalogContext();
        const conversationId = input.conversationId ?? (await db.createConversation(ctx.user?.id, input.anonymousId, "marketplace help"));
        await db.addChatMessage(conversationId, "user", input.message, pickReferencedEventIds(input.message, catalog));
        const context = {
          verifiedCatalog: catalog,
          policyFacts: POLICY_FACTS,
          restrictions: [
            "Every catalog item currently has isDemo=true and must be presented as DEMO/TEST, not as a live ticket offer.",
            "No actual payment credentials, actual delivery confirmation, real refund approval, real availability or real market price exists in this data.",
            "Never estimate or invent an event, ticket, price, availability, venue, policy, delivery timeline or legal commitment.",
            "When the database has no answer, say that VÉLORA cannot verify it yet and direct the visitor to available catalog records or veloratickets@proton.me.",
          ],
        };
        const system = `You are VÉLORA Assist, a concise premium ticket marketplace guide. Answer from ONLY the verified data in the JSON context. You can help find catalog records, compare shown ticket tiers, explain the DEMO checkout flow and summarize explicitly supplied policy facts. If no relevant record exists, say you cannot verify that information. Link relevant records by adding a final line in this exact format when applicable: RELATED_SLUGS: slug-one,slug-two. Never write URLs. Never claim something is live, available, confirmed, delivered, refundable, secure, cheapest, or guaranteed.\n\nCONTEXT:\n${JSON.stringify(context)}`;
        let response = "I can help search the VÉLORA catalog, compare the demo ticket tiers shown on an event page, or explain the DEMO checkout flow. Tell me an event, city or ticket question.";
        try {
          const completion = await invokeLLM({ model: "gpt-5-mini", messages: [{ role: "system", content: system }, { role: "user", content: input.message }], maxTokens: 500 });
          const content = completion.choices[0]?.message.content;
          if (typeof content === "string" && content.trim()) response = content.trim();
        } catch (error) {
          console.warn("[Assistant] unavailable", String(error));
        }
        const mentioned = catalog.filter((event) => response.toLowerCase().includes(event.slug.toLowerCase()) || response.toLowerCase().includes(event.title.toLowerCase())).map((event) => event.id);
        const cleaned = response.replace(/\n?RELATED_SLUGS:\s*[^\n]+/i, "").trim();
        await db.addChatMessage(conversationId, "assistant", cleaned, mentioned);
        return { conversationId, response: cleaned, related: catalog.filter((event) => mentioned.includes(event.id)) };
      }),
  }),
  content: router({
    list: publicProcedure.query(() => db.listArticles()),
    runNow: protectedProcedure.mutation(async ({ ctx }) => {
      assertAdmin(ctx.user);
      return runDailyContent({ force: true });
    }),
  }),
  admin: router({
    snapshot: protectedProcedure.query(async ({ ctx }) => {
      assertAdmin(ctx.user);
      return db.getAdminSnapshot();
    }),
    eventFlags: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), isVeloraPick: z.boolean().optional(), isTrending: z.boolean().optional(), isPublished: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.user);
      await db.updateEventFlags(input.eventId, input);
      return { ok: true };
    }),
    automation: protectedProcedure
      .input(z.object({ action: z.enum(["enable", "disable", "run", "refresh-opportunities", "catalog-enable", "catalog-disable", "catalog-run"]), autoPublish: z.boolean().optional() }))
      .mutation(async ({ ctx, input }) => {
        assertAdmin(ctx.user);
        const automation = await db.getAutomation();
        if (!automation) throw new Error("Automation record unavailable");
        if (input.action === "run") return runDailyContent({ force: true });
        if (input.action === "refresh-opportunities") return updateCatalogSeoOpportunities();
        if (input.action === "catalog-run") {
          const result = await runCatalogSync();
          await db.updateAutomation(automation.id, { catalogLastRunAt: new Date(), catalogLastStatus: result.message });
          return result;
        }
        if (input.action === "catalog-enable") {
          if (automation.catalogSyncTaskUid) return db.updateAutomation(automation.id, { catalogSyncEnabled: true });
          const job = await createHeartbeatJob({
            name: "velora-catalog-sync",
            cron: automation.cronExpression,
            path: "/api/scheduled/catalog",
            description: "Verify and refresh VÉLORA event and ticket records",
          }, sessionToken(ctx.req.headers.cookie));
          return db.updateAutomation(automation.id, { catalogSyncEnabled: true, catalogSyncTaskUid: job.taskUid, catalogLastStatus: "Scheduled provider verification", lastStatus: "Content and catalog schedules enabled" });
        }
        if (input.action === "catalog-disable") {
          if (automation.catalogSyncTaskUid) await updateHeartbeatJob(automation.catalogSyncTaskUid, { enable: false }, sessionToken(ctx.req.headers.cookie));
          return db.updateAutomation(automation.id, { catalogSyncEnabled: false, catalogLastStatus: "Catalog sync paused" });
        }
        const enabled = input.action === "enable";
        if (enabled && !automation.scheduleCronTaskUid) {
          const job = await createHeartbeatJob({
            name: "velora-daily-catalog-content",
            cron: automation.cronExpression,
            path: "/api/scheduled/content",
            description: "Create a daily factual VÉLORA catalog guide",
          }, sessionToken(ctx.req.headers.cookie));
          await db.updateAutomation(automation.id, { isEnabled: true, autoPublish: input.autoPublish ?? automation.autoPublish, scheduleCronTaskUid: job.taskUid, nextRunAt: job.nextExecutionAt ? new Date(job.nextExecutionAt) : null, lastStatus: "Scheduled" });
        } else if (!enabled && automation.scheduleCronTaskUid) {
          await updateHeartbeatJob(automation.scheduleCronTaskUid, { enable: false }, sessionToken(ctx.req.headers.cookie));
          await db.updateAutomation(automation.id, { isEnabled: false, lastStatus: "Paused" });
        } else {
          await db.updateAutomation(automation.id, { isEnabled: enabled, autoPublish: input.autoPublish ?? automation.autoPublish, lastStatus: enabled ? "Enabled" : "Paused" });
        }
        return db.getAutomation();
      }),
    deleteAutomation: protectedProcedure.mutation(async ({ ctx }) => {
      assertAdmin(ctx.user);
      const automation = await db.getAutomation();
      if (automation?.scheduleCronTaskUid) await deleteHeartbeatJob(automation.scheduleCronTaskUid, sessionToken(ctx.req.headers.cookie));
      if (automation) await db.updateAutomation(automation.id, { isEnabled: false, scheduleCronTaskUid: null, lastStatus: "Schedule removed" });
      return { ok: true };
    }),
    catalogStatus: protectedProcedure.query(({ ctx }) => {
      assertAdmin(ctx.user);
      return getCatalogProviderStatus();
    }),
    catalogSync: protectedProcedure.mutation(async ({ ctx }) => {
      assertAdmin(ctx.user);
      return runCatalogSync();
    }),
  }),
});

export type AppRouter = typeof appRouter;
