# VÉLORA Delivery Tracker

## Completed features

- [x] Premium VÉLORA brand system, editorial home experience, event discovery, city/category filters, saved-events entry point and customer account screens.
- [x] Populated **DEMO/TEST** catalog for Texas-focused concerts, sports, theater, comedy, festivals and experiences.
- [x] Event detail pages with section/row/seat tiers, a customer-facing transparent price breakdown and pricing-review gating.
- [x] DEMO checkout that does not collect raw card numbers, CVV or wallet credentials; confirmation explicitly states that no real purchase or ticket delivery occurs.
- [x] Persistent VÉLORA Assist chat entry point across all app pages. Server responses are constrained to the supplied VÉLORA fact pack and database record IDs.
- [x] MySQL/TiDB database model and migration for users, events, private inventory, orders, saved events, conversations, messages, email subscribers, content, SEO opportunities, analytics snapshots and settings.
- [x] AI content engine using built-in `gpt-5-mini`, conservative claim validation, internal record linking, FAQ data and safe fallback templates.
- [x] Secure scheduler callback endpoint intended for a managed scheduled task after deployment; no process-local interval is used.
- [x] Protected admin console for marketplace metrics, chatbot usage, content, SEO opportunities, index placeholders and automation controls.
- [x] Journal, policy/about and contact experiences; policy content is explicitly labelled DRAFT/DEMO.
- [x] Crawler endpoints at `/robots.txt` and `/sitemap.xml` on the backend.
- [x] Source documentation in `README.md`.

## Validation

- [x] TypeScript: `pnpm check`.
- [x] Unit tests: `pnpm test` — three pricing safety tests passed; one pre-existing auth logout test is skipped.
- [x] API verification: public health, catalog tRPC response and sitemap endpoint.
- [x] Mobile-web visual verification of home, discovery, event detail, checkout, journal and contact screens.

## Known integration work before production launch

- [ ] Connect an authorized, verified live event/inventory provider and remove or unpublish DEMO records before presenting live availability.
- [ ] Connect a PCI-compliant payment provider using tokenized hosted elements plus verified webhooks; do not add card fields to the VÉLORA server.
- [ ] Connect an authorized ticket-transfer/delivery provider and transactional inventory reservations.
- [ ] Obtain legal review and replace all DRAFT/DEMO policy content before public sales.
- [ ] Connect verified analytics, Search Console and an approved factual research provider before relying on traffic or indexing metrics.
- [ ] Publish the project, then enable the platform-managed daily content schedule from Admin.
- [ ] Configure production support, email and domain services only after business approval.
