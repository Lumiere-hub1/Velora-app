import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppShell, OutlineButton, PALETTE, PageHeader, PrimaryButton } from "@/components/velora-ui";
import { VELORA_CONTACTS } from "@/shared/velora";

export default function Contact() {
  return (
    <AppShell>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <PageHeader title="CONTACT" />
        <ScrollView contentContainerStyle={styles.page}>
          <Text style={styles.eyebrow}>VÉLORA SUPPORT</Text>
          <Text style={styles.title}>WE’RE HERE{`\n`}TO HELP.</Text>
          <Text style={styles.copy}>
            For questions that cannot be answered from the verified VÉLORA catalog, contact the VÉLORA team. If an event, price, availability, policy or ticket source is not verified, we will say so instead of guessing.
          </Text>
          <View style={styles.card}>
            <MaterialIcons name="mail-outline" size={25} color={PALETTE.champagne} />
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{VELORA_CONTACTS.email}</Text>
            <PrimaryButton label="EMAIL VÉLORA" onPress={() => Linking.openURL(VELORA_CONTACTS.emailUrl)} icon="arrow-forward" />
          </View>
          <View style={styles.card}>
            <MaterialIcons name="chat" size={25} color={PALETTE.champagne} />
            <Text style={styles.label}>WHATSAPP</Text>
            <Text style={styles.value}>Direct chat with VÉLORA</Text>
            <OutlineButton label="CHAT WITH VÉLORA ON WHATSAPP" onPress={() => Linking.openURL(VELORA_CONTACTS.whatsappUrl)} icon="open-in-new" />
          </View>
          <View style={styles.card}>
            <MaterialIcons name="alternate-email" size={25} color={PALETTE.champagne} />
            <Text style={styles.label}>TIKTOK</Text>
            <Text style={styles.value}>{VELORA_CONTACTS.tiktokLabel}</Text>
            <OutlineButton label="FOLLOW VÉLORA ON TIKTOK" onPress={() => Linking.openURL(VELORA_CONTACTS.tiktokUrl)} icon="open-in-new" />
          </View>
          <View style={styles.note}>
            <Text style={styles.noteTitle}>A FASTER WAY TO START</Text>
            <Text style={styles.noteText}>Use VÉLORA Assist anywhere in the app to search catalog records, compare displayed DEMO ticket tiers, or ask about current DEMO policy facts. Human help is available through the contact actions above.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PALETTE.cream },
  page: { padding: 22, paddingBottom: 110 },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: PALETTE.champagne, marginTop: 22 },
  title: { fontFamily: "Georgia", fontSize: 38, lineHeight: 40, letterSpacing: -1, color: PALETTE.ink, marginTop: 8 },
  copy: { fontSize: 13, lineHeight: 20, color: PALETTE.muted, marginTop: 15 },
  card: { padding: 19, marginTop: 22, backgroundColor: PALETTE.white, borderWidth: 1, borderColor: PALETTE.border, gap: 8 },
  label: { fontSize: 9, fontWeight: "800", letterSpacing: 1, color: PALETTE.muted, marginTop: 3 },
  value: { fontFamily: "Georgia", fontSize: 21, color: PALETTE.ink, marginBottom: 5 },
  note: { marginTop: 20, padding: 16, backgroundColor: PALETTE.nude, borderLeftWidth: 3, borderColor: PALETTE.champagne },
  noteTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, color: PALETTE.ink },
  noteText: { fontSize: 11, lineHeight: 17, color: PALETTE.muted, marginTop: 7 },
});
