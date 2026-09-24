import * as db from "./db";

export type CatalogProviderStatus = {
  configured: boolean;
  status: "READY" | "PROVIDER_NOT_CONFIGURED";
  providerUrl: string | null;
  requiredConfiguration: string[];
  message: string;
};

export type CatalogSyncResult = CatalogProviderStatus & {
  discovered: number;
  updated: number;
  cancelled: number;
  expired: number;
  duplicatesMerged: number;
};

export function getCatalogProviderStatus(): CatalogProviderStatus {
  const providerUrl = process.env.VELORA_EVENT_PROVIDER_API_URL?.trim() || "";
  const providerKey = process.env.VELORA_EVENT_PROVIDER_API_KEY?.trim() || "";
  const configured = Boolean(providerUrl && providerKey);
  return {
    configured,
    status: configured ? "READY" : "PROVIDER_NOT_CONFIGURED",
    providerUrl: providerUrl || null,
    requiredConfiguration: configured ? [] : ["VELORA_EVENT_PROVIDER_API_URL", "VELORA_EVENT_PROVIDER_API_KEY"],
    message: configured
      ? "Provider credentials are present. The provider adapter must return authoritative event and ticket records before live publishing is enabled."
      : "Automatic discovery is safely paused because no authorized event/ticket provider is configured. DEMO records remain unverified.",
  };
}

/**
 * Safe synchronization boundary. It deliberately performs no network request without
 * both provider values and never promotes a record without source, URL, status and
 * price/availability fields from the provider contract.
 */
export async function runCatalogSync(): Promise<CatalogSyncResult> {
  await db.ensureSeeded();
  const status = getCatalogProviderStatus();
  if (!status.configured) {
    return { ...status, discovered: 0, updated: 0, cancelled: 0, expired: 0, duplicatesMerged: 0 };
  }

  // Provider-specific mapping is intentionally gated until the owner supplies an
  // approved provider contract. Treating an arbitrary API as ticket truth would be
  // unsafe and could create fabricated events or prices.
  return {
    ...status,
    status: "READY",
    message: "Provider credentials detected, but no provider-specific adapter is enabled. Supply the approved provider schema before importing live records.",
    discovered: 0,
    updated: 0,
    cancelled: 0,
    expired: 0,
    duplicatesMerged: 0,
  };
}
