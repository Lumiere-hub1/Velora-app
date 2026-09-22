import { describe, expect, it } from "vitest";
import { TICKET_TIERS, calculatePricing, formatMoney } from "../shared/velora";
import { calculateInventoryPrice } from "../server/db";

describe("VÉLORA pricing engine", () => {
  it("targets ten dollars below a verified comparable only when the margin can support it", () => {
    const tier = TICKET_TIERS[0];
    const result = calculatePricing(tier);
    expect(result.reviewRequired).toBe(false);
    expect(result.sellingPrice).toBe(tier.comparableMarketPrice - 10);
    expect(result.total).toBe(result.sellingPrice + tier.serviceFee + tier.taxes);
  });

  it("flags an unsupported discount instead of presenting a loss-making price", () => {
    const tier = TICKET_TIERS.find((item) => item.status === "PRICING REVIEW REQUIRED");
    expect(tier).toBeDefined();
    const result = calculatePricing(tier!);
    expect(result.reviewRequired).toBe(true);
    expect(result.sellingPrice).toBe(tier!.acquisitionCost + tier!.purchaseFees + tier!.desiredMargin);
    expect(result.sellingPrice).toBeGreaterThan(tier!.comparableMarketPrice - 10);
  });

  it("uses the same safe pricing rule for database inventory records", () => {
    const result = calculateInventoryPrice({
      acquisitionCost: "100.00",
      purchaseFees: "7.00",
      comparableMarketPrice: "110.00",
      serviceFee: "12.00",
      taxes: "8.00",
      desiredMargin: "20.00",
    });
    expect(result.reviewRequired).toBe(true);
    expect(result.sellingPrice).toBe(127);
    expect(formatMoney(result.total)).toBe("$147");
  });
});
