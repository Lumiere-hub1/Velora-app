import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppShell, BrandMark, DemoPill, EVENT_IMAGES, EventCard, OutlineButton, PALETTE, PrimaryButton, ScreenLoading, SectionTitle, styles as ui } from "@/components/velora-ui";
import { CATEGORIES, CITIES, DEMO_EVENTS, VELORA_CONTACTS } from "@/shared/velora";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const { data: liveEvents } = trpc.marketplace.events.useQuery({});
  const events = liveEvents ?? DEMO_EVENTS.map((event, index) => ({ ...event, id: index + 1, startsAt: new Date(event.date) }));
  const subscribe = trpc.marketplace.subscribe.useMutation({ onSuccess: () => Alert.alert("You’re on the list", "DEMO signup saved. Connect an email provider before launch to send messages.") });
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [weekTab, setWeekTab] = useState("TODAY");
  const picks = useMemo(() => (events ?? []).filter((event) => event.isVeloraPick), [events]);
  const trending = useMemo(() => (events ?? []).filter((event) => event.isTrending), [events]);
  const lastMinute = useMemo(() => (events ?? []).filter((event) => (new Date(event.startsAt).getTime() - Date.now()) / 86_400_000 <= 14), [events]);
  const search = () => router.push({ pathname: "/(tabs)/search", params: { q: query } });
  return (
    <AppShell>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <View style={styles.topbar}><BrandMark /><View style={styles.topbarRight}><DemoPill subtle /><Pressable onPress={() => router.push("/(tabs)/account")} style={styles.accountIcon}><MaterialIcons name="person-outline" size={19} color={PALETTE.ink} /></Pressable></View></View>
          <View style={styles.hero}>
            <Image source={EVENT_IMAGES.hero} contentFit="cover" style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} />
            <View style={styles.heroShade} />
            <View style={styles.heroContent}>
              <Text style={styles.heroEyebrow}>PREMIUM ACCESS TO UNFORGETTABLE EXPERIENCES.</Text>
              <Text style={styles.heroTitle}>YOUR NEXT{`\n`}UNFORGETTABLE{`\n`}EXPERIENCE.</Text>
              <Text style={styles.heroBody}>Discover extraordinary concerts, sports, shows and experiences — all in one place.</Text>
              <View style={styles.searchBox}><MaterialIcons name="search" size={20} color={PALETTE.ink} /><TextInput value={query} onChangeText={setQuery} onSubmitEditing={search} placeholder="Artists, teams, events or venues" placeholderTextColor="#7C7770" style={styles.searchInput} returnKeyType="search" /><Pressable onPress={search} style={styles.searchAction}><Text style={styles.searchActionText}>SEARCH</Text></Pressable></View>
              <PrimaryButton label="FIND TICKETS" onPress={() => router.push("/(tabs)/events")} icon="arrow-forward" light />
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle eyebrow="WHAT EVERYONE'S TALKING ABOUT" title="TRENDING NOW" action="SEE ALL" onAction={() => router.push("/(tabs)/events")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>{trending.map((event) => <EventCard event={event} key={event.id} />)}</ScrollView>
          </View>

          <View style={styles.section}>
            <SectionTitle eyebrow="HANDPICKED EXPERIENCES WORTH KNOWING ABOUT" title="VÉLORA PICKS" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>{picks.map((event) => <EventCard event={event} key={event.id} />)}</ScrollView>
          </View>

          <View style={styles.weekSection}>
            <SectionTitle eyebrow="A CURATED WEEK AHEAD" title="HAPPENING THIS WEEK" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekTabs}>{["TODAY", "TOMORROW", "THIS WEEKEND", "NEXT 7 DAYS"].map((tab) => <Pressable key={tab} onPress={() => setWeekTab(tab)} style={{...styles.weekTab, ...(weekTab === tab ? styles.weekTabActive : {})}}><Text style={{...styles.weekTabText, ...(weekTab === tab ? styles.weekTabTextActive : {})}}>{tab}</Text></Pressable>)}</ScrollView>
            <View style={styles.weekList}>{(events ?? []).slice(0, 3).map((event) => <Link key={event.id} href={{ pathname: "/events/[slug]" as any, params: { slug: event.slug } }} asChild><Pressable style={styles.weekEvent}><Image source={EVENT_IMAGES[event.imageKey as keyof typeof EVENT_IMAGES]} style={styles.weekEventImage} contentFit="cover" /><View style={styles.weekEventText}><Text style={styles.weekDate}>{new Date(event.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()} · {new Date(event.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</Text><Text numberOfLines={1} style={styles.weekTitle}>{event.title}</Text><Text numberOfLines={1} style={styles.weekMeta}>{event.venue} · {event.city}</Text></View><MaterialIcons name="arrow-forward" size={18} color={PALETTE.ink} /></Pressable></Link>)}</View>
          </View>

          <View style={styles.section}>
            <SectionTitle eyebrow="SOMETHING AMAZING IS HAPPENING SOON" title="LAST-MINUTE EXPERIENCES" />
            <Text style={styles.tinyNote}>Shown from event dates in the VÉLORA catalog. No scarcity claims or countdowns.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>{lastMinute.map((event) => <EventCard event={event} key={event.id} />)}</ScrollView>
          </View>

          <View style={styles.section}>
            <SectionTitle eyebrow="DISCOVER BY MOOD" title="FIND YOUR KIND OF NIGHT" />
            <View style={styles.categoryGrid}>{CATEGORIES.map((category, index) => <Link key={category} href={{ pathname: "/(tabs)/events", params: { category } }} asChild><Pressable style={{...styles.categoryCard, backgroundColor: ["#252524", "#8E3040", "#6B5A4B", "#1E5A46", "#705943", "#343C52"][index]}}><Text style={styles.categoryText}>{category.toUpperCase()}</Text><MaterialIcons name="north-east" color={PALETTE.cream} size={20} /></Pressable></Link>)}</View>
          </View>

          <View style={styles.cityBand}>
            <Text style={styles.cityEyebrow}>TEXAS, UNITED STATES</Text><Text style={styles.cityTitle}>WHAT’S HAPPENING{`\n`}NEAR YOU</Text>
            <View style={styles.cityList}>{CITIES.map((city) => <Link key={city} href={{ pathname: "/(tabs)/events", params: { city } }} asChild><Pressable style={styles.cityRow}><Text style={styles.cityName}>{city}</Text><MaterialIcons name="arrow-forward" size={19} color={PALETTE.cream} /></Pressable></Link>)}</View>
          </View>

          <View style={styles.premiumSection}>
            <SectionTitle eyebrow="FOR NIGHTS WORTH REMEMBERING" title="VÉLORA PREMIUM" />
            <View style={styles.premiumGrid}>{["VIP", "FLOOR", "CLUB", "PREMIUM SEATING"].map((tier, index) => <View key={tier} style={{...styles.premiumTile, ...(index === 3 ? styles.premiumTileWide : {})}}><Text style={styles.premiumNumber}>0{index + 1}</Text><Text style={styles.premiumLabel}>{tier}</Text><Text style={styles.premiumNote}>Shown only when an underlying ticket record supports this designation.</Text></View>)}</View>
          </View>

          <View style={styles.section}>
            <SectionTitle eyebrow="AN INFORMED WAY TO CHOOSE" title="FIND THE RIGHT SEAT" />
            <View style={styles.seatCard}><Text style={styles.seatLead}>A smart ticket choice is personal.</Text><Text style={styles.seatBody}>Compare section, row, seat details, view information when provided, complete price, and delivery method. VÉLORA labels are informational aids—not universal quality guarantees.</Text><View style={styles.badges}><Text style={styles.badge}>VÉLORA VALUE</Text><Text style={styles.badge}>PREMIUM VIEW</Text><Text style={styles.badge}>GREAT LOCATION</Text></View></View>
          </View>

          <View style={styles.whySection}><Text style={styles.whyEyebrow}>DESIGNED FOR CLARITY</Text><Text style={styles.whyTitle}>WHY VÉLORA</Text><View style={styles.whyGrid}>{[["account-balance-wallet", "CLEAR PRICING", "See the components of the shown total."],["mark-email-read", "DIGITAL DELIVERY", "Delivery method is visible before checkout."],["auto-awesome", "CURATED EXPERIENCES", "Discover catalog records by city and category."],["support-agent", "CUSTOMER SUPPORT", "Questions can be guided to support when facts are unavailable."]].map(([icon, title, copy]) => <View key={title as string} style={styles.whyCard}><MaterialIcons name={icon as any} size={22} color={PALETTE.champagne} /><Text style={styles.whyCardTitle}>{title}</Text><Text style={styles.whyCardBody}>{copy}</Text></View>)}</View></View>

          <View style={styles.signup}><Text style={styles.signupEyebrow}>NEW EVENTS, SPECIAL OPPORTUNITIES AND LAST-MINUTE EXPERIENCES.</Text><Text style={styles.signupTitle}>BE FIRST{`\n`}THROUGH THE DOOR</Text><TextInput value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#7B746E" style={styles.emailInput} /><PrimaryButton label={subscribe.isPending ? "JOINING…" : "JOIN VÉLORA"} onPress={() => subscribe.mutate({ email })} disabled={!email.includes("@") || subscribe.isPending} icon="arrow-forward" /></View>

          <View style={styles.footer}><BrandMark /><Text style={styles.footerText}>© 2026 VÉLORA. DEMO / TEST ENVIRONMENT.</Text><View style={styles.footerActions}><Pressable onPress={() => Linking.openURL(VELORA_CONTACTS.emailUrl)}><Text style={styles.footerAction}>EMAIL</Text></Pressable><Pressable onPress={() => Linking.openURL(VELORA_CONTACTS.tiktokUrl)}><Text style={styles.footerAction}>TIKTOK</Text></Pressable><Pressable onPress={() => Linking.openURL(VELORA_CONTACTS.whatsappUrl)}><Text style={styles.footerAction}>WHATSAPP</Text></Pressable></View><Text style={styles.footerLinks}>Terms · Privacy · Purchase Policy · Delivery · Refunds · Contact</Text><Text style={styles.footerFine}>Policy pages are DRAFT/DEMO and require legal review before launch.</Text></View>
        </ScrollView>
      </SafeAreaView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PALETTE.cream }, page: { paddingBottom: 36 }, topbar: { height: 56, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, topbarRight: { flexDirection: "row", alignItems: "center", gap: 9 }, accountIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.white, borderRadius: 20, borderWidth: 1, borderColor: PALETTE.border }, hero: { height: 650, marginHorizontal: 12, borderRadius: 7, overflow: "hidden", justifyContent: "flex-end" }, heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,.36)" }, heroContent: { padding: 22, paddingBottom: 26, gap: 18 }, heroEyebrow: { color: PALETTE.cream, fontSize: 10, letterSpacing: 1.25, fontWeight: "700", maxWidth: 260 }, heroTitle: { color: PALETTE.white, fontSize: 38, letterSpacing: -1.1, lineHeight: 39, fontWeight: "700", fontFamily: "Georgia" }, heroBody: { color: PALETTE.cream, fontSize: 13, lineHeight: 19, maxWidth: 280 }, searchBox: { minHeight: 52, backgroundColor: PALETTE.cream, borderRadius: 4, paddingLeft: 14, flexDirection: "row", alignItems: "center" }, searchInput: { flex: 1, height: 52, paddingHorizontal: 10, color: PALETTE.ink, fontSize: 12 }, searchAction: { alignSelf: "stretch", paddingHorizontal: 13, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.champagne }, searchActionText: { fontSize: 10, fontWeight: "800", color: PALETTE.ink, letterSpacing: .8 }, section: { paddingHorizontal: 20, marginTop: 50 }, horizontalCards: { paddingRight: 20 }, weekSection: { marginTop: 50, padding: 20, backgroundColor: PALETTE.nude }, weekTabs: { gap: 8, paddingBottom: 16 }, weekTab: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 18, backgroundColor: "#E6DED4" }, weekTabActive: { backgroundColor: PALETTE.ink }, weekTabText: { fontSize: 9, color: PALETTE.ink, fontWeight: "800", letterSpacing: .6 }, weekTabTextActive: { color: PALETTE.cream }, weekList: { gap: 1, backgroundColor: PALETTE.border }, weekEvent: { minHeight: 78, backgroundColor: PALETTE.cream, flexDirection: "row", alignItems: "center", paddingRight: 12, gap: 12 }, weekEventImage: { height: 78, width: 72 }, weekEventText: { flex: 1 }, weekDate: { color: PALETTE.urgency, fontSize: 9, fontWeight: "800", letterSpacing: .6 }, weekTitle: { color: PALETTE.ink, fontSize: 14, fontWeight: "700", marginTop: 4 }, weekMeta: { color: PALETTE.muted, fontSize: 10, marginTop: 4 }, tinyNote: { color: PALETTE.muted, fontSize: 10, lineHeight: 15, marginTop: -7, marginBottom: 15 }, categoryGrid: { gap: 9 }, categoryCard: { height: 83, padding: 17, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", borderRadius: 5 }, categoryText: { color: PALETTE.cream, fontSize: 18, letterSpacing: .5, fontWeight: "700", fontFamily: "Georgia" }, cityBand: { backgroundColor: PALETTE.ink, marginTop: 52, padding: 24 }, cityEyebrow: { color: PALETTE.champagne, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 }, cityTitle: { color: PALETTE.cream, fontSize: 31, lineHeight: 33, letterSpacing: -.8, fontFamily: "Georgia", marginTop: 8 }, cityList: { marginTop: 21, borderTopWidth: 1, borderTopColor: "#4A4844" }, cityRow: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#4A4844" }, cityName: { color: PALETTE.cream, fontSize: 17, fontWeight: "600" }, premiumSection: { padding: 20, paddingTop: 51 }, premiumGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, premiumTile: { width: "48%", minHeight: 140, padding: 14, backgroundColor: PALETTE.white, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 4 }, premiumTileWide: { width: "100%", minHeight: 116 }, premiumNumber: { color: PALETTE.champagne, fontSize: 12, fontWeight: "800" }, premiumLabel: { color: PALETTE.ink, fontSize: 15, fontWeight: "800", marginTop: 15, letterSpacing: .3 }, premiumNote: { color: PALETTE.muted, fontSize: 10, lineHeight: 14, marginTop: 7 }, seatCard: { padding: 19, backgroundColor: PALETTE.white, borderLeftWidth: 3, borderLeftColor: PALETTE.champagne }, seatLead: { color: PALETTE.ink, fontSize: 20, fontWeight: "700", fontFamily: "Georgia" }, seatBody: { color: PALETTE.muted, fontSize: 12, lineHeight: 18, marginTop: 10 }, badges: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 15 }, badge: { paddingHorizontal: 8, paddingVertical: 5, backgroundColor: PALETTE.nude, color: PALETTE.ink, fontSize: 8, fontWeight: "800", letterSpacing: .4 }, whySection: { marginTop: 50, padding: 23, backgroundColor: "#EEE8E1" }, whyEyebrow: { color: PALETTE.champagne, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 }, whyTitle: { color: PALETTE.ink, fontSize: 29, fontFamily: "Georgia", marginTop: 5 }, whyGrid: { marginTop: 19, gap: 9 }, whyCard: { backgroundColor: PALETTE.cream, padding: 17, borderRadius: 4 }, whyCardTitle: { color: PALETTE.ink, fontSize: 12, fontWeight: "800", letterSpacing: .7, marginTop: 10 }, whyCardBody: { color: PALETTE.muted, fontSize: 11, lineHeight: 16, marginTop: 5 }, signup: { margin: 20, marginTop: 52, padding: 22, backgroundColor: PALETTE.champagne, borderRadius: 5 }, signupEyebrow: { color: PALETTE.ink, fontSize: 9, lineHeight: 14, letterSpacing: .7, fontWeight: "800", maxWidth: 250 }, signupTitle: { color: PALETTE.ink, fontFamily: "Georgia", fontSize: 31, lineHeight: 33, marginTop: 14 }, emailInput: { marginTop: 18, marginBottom: 9, height: 51, paddingHorizontal: 14, borderRadius: 4, backgroundColor: PALETTE.cream, color: PALETTE.ink, fontSize: 13 }, footer: { alignItems: "center", paddingHorizontal: 28, paddingTop: 21, gap: 10 }, footerText: { color: PALETTE.ink, fontSize: 10, fontWeight: "700", letterSpacing: .6 }, footerActions: { flexDirection: "row", gap: 17, marginTop: 2 }, footerAction: { color: PALETTE.ink, fontSize: 9, fontWeight: "800", letterSpacing: .8 }, footerLinks: { color: PALETTE.muted, textAlign: "center", fontSize: 10, lineHeight: 16 }, footerFine: { color: PALETTE.muted, fontSize: 9, lineHeight: 14, textAlign: "center", maxWidth: 300 },
});
