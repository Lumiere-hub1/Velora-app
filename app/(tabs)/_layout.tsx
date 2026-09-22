import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PALETTE } from "@/components/velora-ui";
import { HapticTab } from "@/components/haptic-tab";

const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: "home-filled",
  search: "search",
  events: "confirmation-number",
  saved: "bookmark-border",
  account: "person-outline",
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const paddingBottom = Platform.OS === "web" ? 9 : Math.max(insets.bottom, 9);
  const height = 58 + paddingBottom;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: PALETTE.ink,
        tabBarInactiveTintColor: "#958E86",
        tabBarStyle: { height, paddingTop: 7, paddingBottom, backgroundColor: PALETTE.cream, borderTopColor: PALETTE.border, borderTopWidth: 1 },
        tabBarLabelStyle: { fontSize: 9, fontWeight: "700", letterSpacing: .6, marginTop: 2 },
        tabBarIcon: ({ color, focused }) => <MaterialIcons name={icons[route.name] ?? "circle"} size={22} color={focused ? color : color} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "HOME" }} />
      <Tabs.Screen name="search" options={{ title: "SEARCH" }} />
      <Tabs.Screen name="events" options={{ title: "EVENTS" }} />
      <Tabs.Screen name="saved" options={{ title: "SAVED" }} />
      <Tabs.Screen name="account" options={{ title: "ACCOUNT" }} />
      <Tabs.Screen name="events/[slug]" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="order/[number]" options={{ href: null }} />
      <Tabs.Screen name="blog" options={{ href: null }} />
      <Tabs.Screen name="blog/[slug]" options={{ href: null }} />
      <Tabs.Screen name="contact" options={{ href: null }} />
      <Tabs.Screen name="policy/[type]" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
    </Tabs>
  );
}
