# VÉLORA

**VÉLORA** is a premium, mobile-first digital ticket marketplace MVP focused initially on Texas. It presents a luxury editorial discovery experience for concerts, sports, theater, comedy, festivals and experiences while separating all **DEMO/TEST** catalog data from live commerce.

> **Current status:** The supplied marketplace records, ticket tiers, checkout and orders are intentionally in **DEMO MODE**. No real card payment is processed, no real ticket is delivered, and the application does not assert live availability, market pricing, refund outcomes or business/legal commitments.

## Product capabilities

The Expo mobile application includes a populated homepage, search, category and city filtering, event detail templates, transparent ticket-tier pricing, saved events, account screens, a mobile DEMO checkout and DEMO confirmation experience. It also includes an editorial journal, contact and draft policy pages, an authentication-protected admin console, and a persistent VÉLORA Assist button on every screen.

VÉLORA Assist is server-side and receives a compact **verified database fact pack**. Its system instructions prohibit invented events, ticket tiers, prices, availability, policies, delivery results, refund outcomes and comparable-price claims. If a fact is absent, it must say so. Conversations and linked catalog IDs are stored for admin analytics.

## Architecture

| Layer | Implementation | Purpose |
|---|---|---|
| Client | Expo Router, React Native, TypeScript | iOS, Android and responsive web preview with a mobile-first tab navigation model. |
| Design system | React Native StyleSheet with VÉLORA tokens | Cream, ink and restrained champagne palette; editorial serif display treatment and accessible touch targets. |
| API | Express + tRPC | Validated marketplace, account, checkout, AI, content and admin procedures. |
| Database | MySQL/TiDB + Drizzle ORM | Events, private inventory cost, orders, saved events, subscriber records, content, automation, chat usage, SEO opportunities and settings. |
| Authentication | Manus OAuth | Accounts and role-based operations; the project owner is promoted to `admin` upon sign-in. |
| AI | Built-in `gpt-5-mini` server-side model | Database-grounded VÉLORA Assist and low-cost, guarded content copy editing. |
| Scheduling | Managed HTTPS scheduler endpoint | Daily content engine invokes `/api/scheduled/content` after the deployed app is scheduled in Admin. |

## Demo mode

The database seed creates original fictional records clearly labelled **DEMO/TEST**. It includes events in Dallas, Houston, Austin and San Antonio, ticket tiers and original editorial articles. The database contains an `isDemo` flag on event, inventory, order and article records. The UI, assistant and content engine explicitly disclose this status.

Before launch, switch off demo mode only after all demo records are deleted or unpublished and verified live integrations are in place. The admin database model supports the needed controls; operational launch steps should be reviewed against the business’s inventory and legal process.

## Pricing logic

The ticket pricing engine calculates a customer-facing target only from data stored on the inventory record:

```text
candidate selling price = verified comparable price − $10
minimum sustainable price = acquisition cost + purchase fees + desired margin
customer selling price = max(candidate selling price, minimum sustainable price)
```

When there is no verified comparable market price or the candidate would breach the minimum sustainable price, the record is marked **PRICING REVIEW REQUIRED**. The customer UI never displays acquisition cost, source details, purchase fees, internal margin or profit.

## Content and SEO engine

The admin dashboard supports a daily catalog-grounded content run. It selects only records that exist in the VÉLORA database, creates an original guide, includes FAQ data and internal event linkage, persists a clean slug, title, description, keyword list and social-sharing-ready image key. The `gpt-5-mini` copy-editing step is constrained to supplied facts and passes a conservative claim validator; any failure uses a safe factual template and never calls an external source by default.

The job can be enabled from Admin after deployment. It uses a platform-managed HTTPS scheduler rather than an in-memory interval, so it survives application restarts. A future external research adapter can add verifiable public-source context once a provider API key and legal/quality workflow are connected. It should not publish claims until that integration is implemented and tested.

The MVP currently tracks catalog-derived long-tail opportunities, content status, indexed-page placeholders and demo traffic. Connect Google Search Console or a verified analytics provider for real indexing and traffic metrics before launch.

## Local setup

```bash
pnpm install
pnpm dev
```

The managed project runtime supplies the standard database, auth and built-in AI environment variables. For a standalone deployment, configure these server-side values:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string. |
| `JWT_SECRET` | Session-signing secret. |
| `VITE_APP_ID` | Manus OAuth application ID. |
| `OAUTH_SERVER_URL` | OAuth service base URL. |
| `BUILT_IN_FORGE_API_URL` | Built-in Manus API base URL. |
| `BUILT_IN_FORGE_API_KEY` | Built-in AI, storage and managed scheduler key. |
| `OWNER_OPEN_ID` | Application owner; assigned the `admin` role on sign-in. |

Never commit production secrets.

## Database setup

The project includes `drizzle/0001_lethal_juggernaut.sql`, which creates all marketplace tables. In an environment with a configured database:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

The deployed project has already been migrated through the managed database tool. Initial data is idempotently seeded by the API on first catalog access.

## Payments and inventory

Payment is modular but presently **DEMO-only**. The checkout deliberately does not collect card number, CVV, wallet credentials or passwords. To enable live commerce, connect a PCI-compliant provider such as Stripe using tokenized payment elements and server-side webhooks, then change the order state machine only after verified provider confirmation.

Inventory is likewise provider-agnostic. Connect only inventory the business controls or is authorized to list; use transactional reservations and supplier transfer confirmations before presenting live availability or delivery states. The existing inventory table and pricing flags are designed for that connection.

## Future integrations

The architecture has clean boundaries for: verified event data; authorized inventory; comparable market data; payment processing; ticket transfer; email delivery; customer support; analytics; search-console indexing; external content research; and social publishing. None is represented as connected until it is configured and tested.

## Deployment

1. Run type checks and tests.
2. Save a project checkpoint and publish from the managed project controls.
3. Sign in as the owner to confirm the admin role.
4. In **Admin**, enable the daily content job only after publishing; the managed platform will schedule the secure callback.
5. Configure real providers and legal pages before disabling DEMO MODE.

Do not purchase or connect a custom domain until a business owner expressly approves it.

## GitHub

The source is intended to be pushed to the connected `Lumiere-hub1/Velora-app` repository without secrets. The repository remains the portable source-of-truth; managed runtime credentials and database state are not committed.
