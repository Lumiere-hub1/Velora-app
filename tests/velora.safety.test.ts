import { afterEach, describe, expect, it } from "vitest";
import { getCatalogProviderStatus } from "../server/catalog-sync";
import { DEMO_EVENTS, TICKET_TIERS, VELORA_CONTACTS } from "../shared/velora";

describe("VÉLORA verification boundaries", () => {
  afterEach(() => {
    delete process.env.VELORA_EVENT_PROVIDER_API_URL;
    delete process.env.VELORA_EVENT_PROVIDER_API_KEY;
  });

  it("marks every bundled event and ticket tier as unverified demo data", () => {
    expect(DEMO_EVENTS.every((event) => event.isDemo && event.verificationStatus === "UNVERIFIED")).toBe(true);
    expect(TICKET_TIERS.every((tier) => tier.verificationStatus === "UNVERIFIED")).toBe(true);
  });

  it("does not report a provider as ready without both required credentials", () => {
    expect(getCatalogProviderStatus().status).toBe("PROVIDER_NOT_CONFIGURED");
    process.env.VELORA_EVENT_PROVIDER_API_URL = "https://provider.example/events";
    expect(getCatalogProviderStatus().status).toBe("PROVIDER_NOT_CONFIGURED");
  });

  it("keeps official contact destinations explicit and actionable", () => {
    expect(VELORA_CONTACTS.email).toBe("veloratickets@proton.me");
    expect(VELORA_CONTACTS.whatsappUrl).toMatch(/^https:\/\/wa\.me\//);
    expect(VELORA_CONTACTS.tiktokUrl).toMatch(/^https:\/\/www\.tiktok\.com\/@/);
  });
});
