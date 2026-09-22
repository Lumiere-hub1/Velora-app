import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { formatEventDate, formatMoney } from "@/shared/velora";

export const PALETTE = {
  cream: "#FAF8F4",
  ink: "#171717",
  champagne: "#C9A96E",
  nude: "#F1ECE6",
  white: "#FFFFFF",
  success: "#1E5A46",
  urgency: "#8E3040",
  muted: "#6F6A64",
  border: "#E4DED6",
  dark: "#20201F",
};

export const EVENT_IMAGES = {
  hero: require("@/assets/images/velora-hero.jpg"),
  sports: require("@/assets/images/velora-sports.jpg"),
  theater: require("@/assets/images/velora-theater.jpg"),
  comedy: require("@/assets/images/velora-comedy.jpg"),
  festival: require("@/assets/images/velora-festival.jpg"),
} as const;

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <View style={styles.brandLockup}>
      <Text style={[styles.brand, inverse && { color: PALETTE.cream }]}>VÉLORA</Text>
      <View style={[styles.brandDot, inverse && { backgroundColor: PALETTE.champagne }]} />
    </View>
  );
}

export function DemoPill({ subtle = false }: { subtle?: boolean }) {
  return <Text style={[styles.demoPill, subtle && styles.demoPillSubtle]}>DEMO MODE</Text>;
}

export function PageHeader({ title, back = true, right }: { title?: string; back?: boolean; right?: React.ReactNode }) {
  return (
    <View style={styles.safeHeader}>
      <View style={styles.header}>
        <Pressable onPress={() => (back ? router.back() : router.replace("/"))} style={styles.iconButton}>
          <MaterialIcons name={back ? "arrow-back" : "home"} size={22} color={PALETTE.ink} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{title ?? "VÉLORA"}</Text>
        <View style={styles.headerRight}>{right ?? <BrandMark />}</View>
      </View>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false, icon, light = false }: { label: string; onPress: () => void; disabled?: boolean; icon?: keyof typeof MaterialIcons.glyphMap; light?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, light && styles.lightButton, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text style={[styles.primaryButtonText, light && styles.lightButtonText]}>{label}</Text>
      {icon ? <MaterialIcons name={icon} size={18} color={light ? PALETTE.ink : PALETTE.cream} /> : null}
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof MaterialIcons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
      <Text style={styles.outlineButtonText}>{label}</Text>
      {icon ? <MaterialIcons name={icon} size={18} color={PALETTE.ink} /> : null}
    </Pressable>
  );
}

export function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && onAction ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function EventCard({ event, compact = false }: { event: any; compact?: boolean }) {
  const image = EVENT_IMAGES[(event.imageKey || "hero") as keyof typeof EVENT_IMAGES] ?? EVENT_IMAGES.hero;
  return (
    <Link href={{ pathname: "/events/[slug]", params: { slug: event.slug } } as any} asChild>
      <Pressable style={({ pressed }) => [styles.eventCard, compact && styles.eventCardCompact, pressed && styles.pressed]}>
        <Image source={image} contentFit="cover" transition={300} style={styles.eventImage} />
        <View style={styles.eventGradient} />
        <View style={styles.eventInfo}>
          <View style={styles.eventMetaRow}>
            {event.isDemo ? <DemoPill /> : null}
            {event.isVeloraPick ? <Text style={styles.cardAccent}>VÉLORA PICK</Text> : null}
          </View>
          <Text numberOfLines={2} style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDetails}>{formatEventDate(event.startsAt || event.date, true)} · {event.venue}</Text>
          <View style={styles.eventBottom}>
            <Text style={styles.eventCity}>{event.city}, TX</Text>
            <Text style={styles.eventPrice}>{event.fromPrice ? `from ${formatMoney(event.fromPrice)}` : "Pricing pending"}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export function EmptyState({ icon = "event-busy", title, body, actionLabel, onAction }: { icon?: keyof typeof MaterialIcons.glyphMap; title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><MaterialIcons name={icon} size={26} color={PALETTE.champagne} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

export function ScreenLoading() {
  return <View style={styles.loading}><ActivityIndicator color={PALETTE.champagne} size="large" /><Text style={styles.loadingText}>Curating your VÉLORA experience</Text></View>;
}

function useAnonymousId() {
  return useMemo(() => `velora-${Math.random().toString(36).slice(2, 10)}`, []);
}

export function AssistantButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "assistant" | "user"; content: string; related?: any[] }>>([
    { role: "assistant", content: "Welcome to VÉLORA Assist. I can search the catalog, compare the DEMO ticket tiers displayed on an event, or explain the DEMO checkout flow. What are you looking for?" },
  ]);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const anonymousId = useAnonymousId();
  const ask = trpc.assistant.ask.useMutation({
    onSuccess: (result) => {
      setConversationId(result.conversationId);
      setMessages((current) => [...current, { role: "assistant", content: result.response, related: result.related }]);
    },
    onError: () => setMessages((current) => [...current, { role: "assistant", content: "I’m unable to reach the verified VÉLORA catalog right now. Please try again in a moment." }]),
  });
  const send = () => {
    const trimmed = message.trim();
    if (!trimmed || ask.isPending) return;
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setMessage("");
    ask.mutate({ message: trimmed, anonymousId, conversationId });
  };
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.assistantBubble, pressed && styles.pressed]}>
        <MaterialIcons name="chat-bubble-outline" size={22} color={PALETTE.cream} />
        <Text style={styles.assistantBubbleText}>ASK VÉLORA</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.assistantModal} edges={["top", "bottom", "left", "right"]}>
          <View style={styles.assistantHeader}>
            <View><BrandMark /><Text style={styles.assistantSubhead}>Catalog-grounded assistance</Text></View>
            <Pressable onPress={() => setOpen(false)} style={styles.iconButton}><MaterialIcons name="close" size={22} color={PALETTE.ink} /></Pressable>
          </View>
          <View style={styles.assistantNotice}><MaterialIcons name="verified-user" size={15} color={PALETTE.success} /><Text style={styles.assistantNoticeText}>Answers are limited to VÉLORA’s actual catalog and DEMO policy facts.</Text></View>
          <ScrollView contentContainerStyle={styles.chatList} keyboardShouldPersistTaps="handled">
            {messages.map((item, index) => (
              <View key={`${item.role}-${index}`} style={[styles.messageWrap, item.role === "user" && styles.userMessageWrap]}>
                <View style={[styles.message, item.role === "user" ? styles.userMessage : styles.assistantMessage]}><Text style={[styles.messageText, item.role === "user" && { color: PALETTE.cream }]}>{item.content}</Text></View>
                {item.related?.map((event) => <Link key={event.id} href={{ pathname: "/events/[slug]", params: { slug: event.slug } } as any} asChild><Pressable style={styles.relatedLink}><Text style={styles.relatedLinkText}>View {event.title} →</Text></Pressable></Link>)}
              </View>
            ))}
            {ask.isPending ? <View style={styles.messageWrap}><View style={styles.assistantMessage}><ActivityIndicator size="small" color={PALETTE.champagne} /></View></View> : null}
          </ScrollView>
          <View style={styles.chatInputRow}>
            <TextInput value={message} onChangeText={setMessage} onSubmitEditing={send} placeholder="Ask about an event or ticket tier" placeholderTextColor={PALETTE.muted} style={styles.chatInput} returnKeyType="send" />
            <Pressable onPress={send} style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}><MaterialIcons name="arrow-upward" size={20} color={PALETTE.cream} /></Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

export function AppShell({ children, assistant = true }: { children: React.ReactNode; assistant?: boolean }) {
  return <View style={styles.appShell}>{children}{assistant ? <AssistantButton /> : null}</View>;
}

export function showDemoNotice() {
  if (Platform.OS === "web") return;
  Alert.alert("DEMO MODE", "This action uses TEST data. No real payment will be processed and no real ticket will be delivered.");
}

export const styles = StyleSheet.create({
  appShell: { flex: 1, backgroundColor: PALETTE.cream },
  safeHeader: { backgroundColor: PALETTE.cream, paddingTop: 12 },
  header: { height: 60, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: PALETTE.border },
  headerTitle: { position: "absolute", left: 76, right: 76, textAlign: "center", fontSize: 15, fontWeight: "700", letterSpacing: 1.2, color: PALETTE.ink },
  headerRight: { minWidth: 42, alignItems: "flex-end" },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.white, borderWidth: 1, borderColor: PALETTE.border },
  brandLockup: { flexDirection: "row", alignItems: "center", gap: 5 },
  brand: { fontSize: 15, letterSpacing: 2.1, fontWeight: "700", color: PALETTE.ink },
  brandDot: { height: 5, width: 5, borderRadius: 3, backgroundColor: PALETTE.champagne, marginTop: -8 },
  demoPill: { fontSize: 9, letterSpacing: 1, fontWeight: "800", color: PALETTE.cream, backgroundColor: "rgba(23,23,23,.76)", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 20, overflow: "hidden" },
  demoPillSubtle: { color: PALETTE.urgency, backgroundColor: "#F7E7EA" },
  primaryButton: { minHeight: 52, paddingHorizontal: 20, borderRadius: 4, backgroundColor: PALETTE.ink, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  primaryButtonText: { fontSize: 12, fontWeight: "800", letterSpacing: 1.25, color: PALETTE.cream },
  lightButton: { backgroundColor: PALETTE.cream },
  lightButtonText: { color: PALETTE.ink },
  outlineButton: { minHeight: 48, paddingHorizontal: 18, borderRadius: 4, borderWidth: 1, borderColor: PALETTE.ink, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  outlineButtonText: { fontSize: 12, fontWeight: "800", letterSpacing: 1.1, color: PALETTE.ink },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  eyebrow: { color: PALETTE.champagne, fontSize: 10, letterSpacing: 1.5, fontWeight: "800", marginBottom: 5 },
  sectionTitleRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 15 },
  sectionTitle: { color: PALETTE.ink, fontSize: 27, fontWeight: "700", letterSpacing: -0.5, fontFamily: Platform.select({ ios: "Georgia", default: "serif" }) },
  sectionAction: { color: PALETTE.ink, fontSize: 11, letterSpacing: 1.1, fontWeight: "800", paddingBottom: 4 },
  eventCard: { width: 274, height: 365, borderRadius: 6, overflow: "hidden", backgroundColor: PALETTE.dark, marginRight: 14 },
  eventCardCompact: { width: "100%", height: 174, marginRight: 0, marginBottom: 13 },
  eventImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  eventImageCompact: { },
  eventGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,.18)" },
  eventInfo: { flex: 1, justifyContent: "flex-end", padding: 16, backgroundColor: "rgba(0,0,0,.18)" },
  eventMetaRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 9 },
  cardAccent: { color: PALETTE.cream, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  eventTitle: { color: PALETTE.white, fontSize: 21, fontWeight: "700", lineHeight: 24, fontFamily: Platform.select({ ios: "Georgia", default: "serif" }) },
  eventDetails: { color: "#F4EFEA", fontSize: 11, lineHeight: 16, marginTop: 7 },
  eventBottom: { marginTop: 13, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,.38)", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  eventCity: { color: PALETTE.cream, fontSize: 10, fontWeight: "700" },
  eventPrice: { color: PALETTE.cream, fontSize: 10, fontWeight: "700" },
  emptyState: { padding: 28, borderRadius: 8, alignItems: "center", backgroundColor: PALETTE.white, borderWidth: 1, borderColor: PALETTE.border, gap: 10 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.nude },
  emptyTitle: { fontSize: 19, fontWeight: "700", color: PALETTE.ink, textAlign: "center" },
  emptyBody: { color: PALETTE.muted, fontSize: 13, lineHeight: 19, textAlign: "center", maxWidth: 280, marginBottom: 8 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: PALETTE.cream },
  loadingText: { color: PALETTE.muted, fontSize: 12, letterSpacing: .3 },
  assistantBubble: { position: "absolute", right: 18, bottom: Platform.OS === "web" ? 26 : 86, zIndex: 30, backgroundColor: PALETTE.ink, borderRadius: 28, paddingHorizontal: 16, height: 52, flexDirection: "row", alignItems: "center", gap: 8, shadowColor: "#000", shadowOpacity: .22, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  assistantBubbleText: { color: PALETTE.cream, fontSize: 10, letterSpacing: 1.1, fontWeight: "800" },
  assistantModal: { flex: 1, backgroundColor: PALETTE.cream },
  assistantHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: PALETTE.border },
  assistantSubhead: { fontSize: 11, color: PALETTE.muted, marginTop: 5 },
  assistantNotice: { margin: 16, padding: 11, borderRadius: 5, backgroundColor: "#E8F0EA", flexDirection: "row", gap: 8, alignItems: "flex-start" },
  assistantNoticeText: { flex: 1, color: PALETTE.success, fontSize: 11, lineHeight: 15 },
  chatList: { paddingHorizontal: 18, paddingBottom: 18, gap: 12 },
  messageWrap: { alignItems: "flex-start", maxWidth: "88%" },
  userMessageWrap: { alignSelf: "flex-end", alignItems: "flex-end" },
  message: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14 },
  assistantMessage: { backgroundColor: PALETTE.white, borderWidth: 1, borderColor: PALETTE.border, borderBottomLeftRadius: 3 },
  userMessage: { backgroundColor: PALETTE.ink, borderBottomRightRadius: 3 },
  messageText: { color: PALETTE.ink, fontSize: 13, lineHeight: 19 },
  relatedLink: { marginTop: 7, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: PALETTE.nude, borderRadius: 4 },
  relatedLinkText: { fontSize: 10, fontWeight: "700", color: PALETTE.ink },
  chatInputRow: { padding: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: PALETTE.border, flexDirection: "row", gap: 8, backgroundColor: PALETTE.cream },
  chatInput: { flex: 1, minHeight: 47, paddingHorizontal: 14, fontSize: 13, color: PALETTE.ink, backgroundColor: PALETTE.white, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 5 },
  sendButton: { width: 47, height: 47, borderRadius: 5, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.ink },
});
