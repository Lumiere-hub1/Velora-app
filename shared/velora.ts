export type EventCategory =
  | "Concerts"
  | "Sports"
  | "Theater"
  | "Comedy"
  | "Festivals"
  | "Experiences";

export type DemoEvent = {
  slug: string;
  title: string;
  category: EventCategory;
  artist: string;
  date: string;
  venue: string;
  city: "Dallas" | "Houston" | "Austin" | "San Antonio";
  state: "TX";
  description: string;
  imageKey: "hero" | "sports" | "theater" | "comedy" | "festival";
  fromPrice: number;
  isVeloraPick: boolean;
  isTrending: boolean;
  isDemo: true;
  badge?: string;
};

export type TicketTier = {
  id: string;
  section: string;
  row: string;
  seats: string;
  quantity: number;
  label: "VÉLORA VALUE" | "PREMIUM VIEW" | "GREAT LOCATION";
  delivery: "Mobile transfer" | "Digital delivery";
  comparableMarketPrice: number;
  acquisitionCost: number;
  purchaseFees: number;
  serviceFee: number;
  taxes: number;
  desiredMargin: number;
  status: "AVAILABLE" | "PRICING REVIEW REQUIRED";
};

export type PricingResult = {
  sellingPrice: number;
  serviceFee: number;
  taxes: number;
  total: number;
  reviewRequired: boolean;
  comparableMarketPrice: number;
};

export const DEMO_EVENTS: DemoEvent[] = [
  {
    slug: "luna-dallas-afterglow-demo",
    title: "LUNA — AFTERGLOW (DEMO)",
    category: "Concerts",
    artist: "LUNA",
    date: "2026-09-24T19:30:00-05:00",
    venue: "Crescent Hall",
    city: "Dallas",
    state: "TX",
    description:
      "A cinematic pop performance concept created solely for VÉLORA’s demo environment. Listing details, ticket data and inventory are TEST records, not a live event offer.",
    imageKey: "hero",
    fromPrice: 84,
    isVeloraPick: true,
    isTrending: true,
    isDemo: true,
    badge: "VÉLORA PICK",
  },
  {
    slug: "texas-derby-night-demo",
    title: "TEXAS DERBY NIGHT (DEMO)",
    category: "Sports",
    artist: "Texas Derby",
    date: "2026-09-26T18:00:00-05:00",
    venue: "Northline Stadium",
    city: "Houston",
    state: "TX",
    description:
      "A premium stadium-game demo listing used to test discovery, tier selection and transparent price breakdowns. It is not live inventory.",
    imageKey: "sports",
    fromPrice: 68,
    isVeloraPick: true,
    isTrending: true,
    isDemo: true,
    badge: "LAST-MINUTE",
  },
  {
    slug: "the-last-garden-demo",
    title: "THE LAST GARDEN (DEMO)",
    category: "Theater",
    artist: "The Last Garden",
    date: "2026-10-02T20:00:00-05:00",
    venue: "The Marlowe Theatre",
    city: "Dallas",
    state: "TX",
    description:
      "An original theatrical demo record demonstrating VÉLORA’s show pages, delivery notes and informed seat-choice education.",
    imageKey: "theater",
    fromPrice: 102,
    isVeloraPick: false,
    isTrending: true,
    isDemo: true,
  },
  {
    slug: "late-set-austin-demo",
    title: "THE LATE SET (DEMO)",
    category: "Comedy",
    artist: "The Late Set",
    date: "2026-09-25T21:30:00-05:00",
    venue: "Juniper Room",
    city: "Austin",
    state: "TX",
    description:
      "An intimate comedy-room demo listing. The venue, performance and ticket availability shown here are TEST data.",
    imageKey: "comedy",
    fromPrice: 42,
    isVeloraPick: false,
    isTrending: false,
    isDemo: true,
    badge: "TONIGHT",
  },
  {
    slug: "golden-hour-festival-demo",
    title: "GOLDEN HOUR FESTIVAL (DEMO)",
    category: "Festivals",
    artist: "Golden Hour Festival",
    date: "2026-10-10T15:00:00-05:00",
    venue: "Riverbend Grounds",
    city: "San Antonio",
    state: "TX",
    description:
      "A visual festival demo record for VÉLORA. The page contains test inventory only and does not represent a real festival offering.",
    imageKey: "festival",
    fromPrice: 95,
    isVeloraPick: true,
    isTrending: true,
    isDemo: true,
    badge: "VÉLORA PICK",
  },
  {
    slug: "skyline-terrace-dinner-demo",
    title: "SKYLINE TERRACE DINNER (DEMO)",
    category: "Experiences",
    artist: "Skyline Terrace",
    date: "2026-10-05T18:30:00-05:00",
    venue: "Terrace 17",
    city: "Austin",
    state: "TX",
    description:
      "A TEST-only culinary experience listing, included to demonstrate category discovery and mobile checkout flow.",
    imageKey: "hero",
    fromPrice: 120,
    isVeloraPick: false,
    isTrending: false,
    isDemo: true,
  },
  {
    slug: "midnight-motion-demo",
    title: "MIDNIGHT MOTION (DEMO)",
    category: "Concerts",
    artist: "Midnight Motion",
    date: "2026-10-16T20:00:00-05:00",
    venue: "Orchid Auditorium",
    city: "Houston",
    state: "TX",
    description:
      "An original concert demo record used for product testing. VÉLORA does not represent this record as an available real-world event.",
    imageKey: "hero",
    fromPrice: 76,
    isVeloraPick: false,
    isTrending: false,
    isDemo: true,
  },
  {
    slug: "open-court-series-demo",
    title: "OPEN COURT SERIES (DEMO)",
    category: "Sports",
    artist: "Open Court Series",
    date: "2026-10-18T14:00:00-05:00",
    venue: "Trinity Arena",
    city: "Dallas",
    state: "TX",
    description:
      "A VÉLORA test record that models an afternoon sports event. Dates, prices and tickets are demo-only.",
    imageKey: "sports",
    fromPrice: 59,
    isVeloraPick: false,
    isTrending: false,
    isDemo: true,
  },
  {
    slug: "bloom-after-dark-demo",
    title: "BLOOM AFTER DARK (DEMO)",
    category: "Experiences",
    artist: "Bloom After Dark",
    date: "2026-10-24T19:00:00-05:00",
    venue: "The Conservatory",
    city: "San Antonio",
    state: "TX",
    description:
      "An original evening-experience demo entry. No real tickets or availability are represented in this example.",
    imageKey: "festival",
    fromPrice: 88,
    isVeloraPick: true,
    isTrending: false,
    isDemo: true,
  },
];

export const TICKET_TIERS: TicketTier[] = [
  {
    id: "demo-floor-1",
    section: "FLOOR A",
    row: "12",
    seats: "14–15",
    quantity: 2,
    label: "PREMIUM VIEW",
    delivery: "Mobile transfer",
    comparableMarketPrice: 165,
    acquisitionCost: 102,
    purchaseFees: 8,
    serviceFee: 14,
    taxes: 9,
    desiredMargin: 18,
    status: "AVAILABLE",
  },
  {
    id: "demo-club-2",
    section: "CLUB 114",
    row: "8",
    seats: "7–8",
    quantity: 2,
    label: "GREAT LOCATION",
    delivery: "Digital delivery",
    comparableMarketPrice: 132,
    acquisitionCost: 91,
    purchaseFees: 6,
    serviceFee: 12,
    taxes: 8,
    desiredMargin: 15,
    status: "AVAILABLE",
  },
  {
    id: "demo-upper-3",
    section: "UPPER 304",
    row: "18",
    seats: "21–22",
    quantity: 2,
    label: "VÉLORA VALUE",
    delivery: "Digital delivery",
    comparableMarketPrice: 92,
    acquisitionCost: 67,
    purchaseFees: 5,
    serviceFee: 9,
    taxes: 6,
    desiredMargin: 14,
    status: "AVAILABLE",
  },
  {
    id: "demo-vip-4",
    section: "VIP TERRACE",
    row: "4",
    seats: "3–4",
    quantity: 2,
    label: "PREMIUM VIEW",
    delivery: "Mobile transfer",
    comparableMarketPrice: 240,
    acquisitionCost: 215,
    purchaseFees: 12,
    serviceFee: 18,
    taxes: 14,
    desiredMargin: 24,
    status: "PRICING REVIEW REQUIRED",
  },
];

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    amount,
  );

export const formatEventDate = (date: string, includeTime = false) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(date));

export function calculatePricing(ticket: TicketTier): PricingResult {
  const acquisitionTotal = ticket.acquisitionCost + ticket.purchaseFees;
  const minimumSustainablePrice = acquisitionTotal + ticket.desiredMargin;
  const marketTarget = ticket.comparableMarketPrice - 10;
  const reviewRequired = marketTarget < minimumSustainablePrice;
  const sellingPrice = reviewRequired ? minimumSustainablePrice : marketTarget;
  return {
    sellingPrice,
    serviceFee: ticket.serviceFee,
    taxes: ticket.taxes,
    total: sellingPrice + ticket.serviceFee + ticket.taxes,
    reviewRequired,
    comparableMarketPrice: ticket.comparableMarketPrice,
  };
}

export const DEMO_BLOG_POSTS = [
  {
    slug: "best-concert-experiences-dallas-demo",
    title: "Best Concert Experiences in Dallas: A VÉLORA Seat-Selection Guide",
    category: "Guides",
    excerpt:
      "A practical, test-environment guide to comparing sections, rows, delivery methods and all-in totals before a concert purchase.",
    readTime: "5 min read",
    updatedAt: "2026-09-20",
    imageKey: "hero" as const,
    body: [
      "This is DEMO content for VÉLORA’s editorial system. It is educational only and does not confirm event, price, availability or policy information beyond the records shown in the app.",
      "Start with the overall experience you want. A close section can mean a more immersive atmosphere, while a higher section can provide a wider view of the staging. VÉLORA presents section, row, delivery method and a complete demo price breakdown so you can compare like for like.",
      "Before checkout, review the per-ticket price, service fee and applicable tax display. In this demo environment, payment and delivery are simulated and no real ticket purchase is completed.",
    ],
  },
  {
    slug: "houston-weekend-planning-demo",
    title: "What’s Happening in Houston This Weekend: How to Compare Options",
    category: "Local guides",
    excerpt:
      "A focused planning framework for comparing date, venue, ticket tier and delivery details—without relying on unverified availability.",
    readTime: "4 min read",
    updatedAt: "2026-09-18",
    imageKey: "sports" as const,
    body: [
      "This DEMO article is populated from VÉLORA sample records. Check the individual event page for the current records displayed by the marketplace.",
      "When two experiences appeal equally, compare the journey first: venue location, start time, ticket delivery method and the all-in customer total. That makes the trade-off clearer than comparing advertised starting prices alone.",
      "VÉLORA never uses a demo ticket price or demo availability to make a claim about real market conditions.",
    ],
  },
  {
    slug: "guide-to-premium-seating-demo",
    title: "A Guide to Premium Seating: Section, Row, Seat and Value",
    category: "Guides",
    excerpt:
      "Learn the vocabulary behind a confident ticket decision, from section and row to transparent total price.",
    readTime: "6 min read",
    updatedAt: "2026-09-15",
    imageKey: "theater" as const,
    body: [
      "Premium seating is not a universal promise; it depends on the event, venue layout and personal preference. This VÉLORA DEMO guide uses informational labels rather than presenting subjective opinions as facts.",
      "Section describes the broad area, row describes position inside it and seat identifies the individual place. Where available, delivery method and restrictions should be compared alongside location.",
      "A transparent total also matters. VÉLORA’s detail screen separates ticket price, service fee and applicable tax so you can make an informed comparison.",
    ],
  },
];

export const POLICY_FACTS = [
  "VÉLORA is currently operating in DEMO MODE. Demo checkout does not process payment or deliver a real ticket.",
  "In the demo experience, digital tickets are represented as emailed or mobile-transfer delivery flows; no real ticket is issued.",
  "Refund, purchase, privacy and delivery pages are DRAFT/DEMO content pending professional legal and business review.",
  "VÉLORA does not claim event availability, competitor prices, ticket delivery or a refund outcome without verified underlying records.",
];

export const CITIES = ["Dallas", "Houston", "Austin", "San Antonio"] as const;
export const CATEGORIES: EventCategory[] = [
  "Concerts",
  "Sports",
  "Theater",
  "Comedy",
  "Festivals",
  "Experiences",
];
