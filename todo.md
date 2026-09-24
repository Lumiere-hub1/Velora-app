# VÉLORA Delivery Tracker

## Completed

- [x] Premium VÉLORA brand system, editorial home experience, event discovery, city/category filters, saved events and account screens.
- [x] Populated Texas-focused **DEMO/TEST** catalog across concerts, sports, theater, comedy, festivals and experiences.
- [x] Event detail pages with section/row/seat tiers, transparent price breakdown and pricing-review gating.
- [x] DEMO checkout that never collects raw card numbers, CVV or wallet credentials; confirmation explicitly states that no real purchase or ticket delivery occurs.
- [x] Persistent VÉLORA Assist chat entry point across app pages. Server responses are constrained to the supplied VÉLORA fact pack and database record IDs.
- [x] MySQL/TiDB data model and migrations for users, events, private inventory, orders, saved events, conversations, messages, content, SEO, analytics, settings and verification metadata.
- [x] Guarded AI content engine using built-in `gpt-5-mini`, conservative claim validation, FAQ data, internal record linking and safe fallback templates.
- [x] Managed scheduler endpoints for daily content and fail-safe catalog synchronization; no process-local interval is used.
- [x] Protected admin console for marketplace metrics, chatbot usage, content, SEO opportunities, indexing placeholders, automation controls and provider status.
- [x] Official email, TikTok and WhatsApp contact actions. The raw phone number is not displayed in the UI.
- [x] Database-only event/search discovery paths when the API is unavailable; no fabricated fallback results on those screens.
- [x] Journal, policy/about and contact experiences; policy content is explicitly labelled DRAFT/DEMO.
- [x] `/robots.txt` and `/sitemap.xml` crawler endpoints.
- [x] Source documentation in `README.md`.

## Validation

- [x] TypeScript: `pnpm check` passed.
- [x] Unit tests: `pnpm test` passed — 2 test files, 6 tests passed, 1 existing auth test skipped.
- [x] Lint: `pnpm lint` passed with 13 non-blocking warnings and 0 errors.
- [x] API: health endpoint, database-backed marketplace tRPC response, robots endpoint and scheduler authentication guard checked.
- [x] Mobile-web visual verification: home, discovery, contact and admin access gate screens captured at 390×844.

## Remaining launch requirements

- [ ] Configure `VELORA_EVENT_PROVIDER_API_URL` and `VELORA_EVENT_PROVIDER_API_KEY` for an authorized provider.
- [ ] Implement and approve the provider-specific adapter before importing live records.
- [ ] Require authoritative source IDs, status/cancellation updates, official source URLs, legitimate ticket URLs, current prices, availability, delivery methods and deduplication rules.
- [ ] Connect PCI-compliant payment, authorized ticket transfer, transactional email, analytics/Search Console and approved factual research providers.
- [ ] Replace DRAFT/DEMO policy content with professionally reviewed production policies.
- [ ] Publish the project, then enable the platform-managed daily content and catalog schedules from Admin.
- [ ] Save the final WebDev checkpoint and push the latest source changes to the connected GitHub repository.
