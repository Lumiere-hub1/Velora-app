import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppShell, BrandMark, EmptyState, EventCard, PALETTE, ScreenLoading } from "@/components/velora-ui";
import { trpc } from "@/lib/trpc";
import { DEMO_EVENTS } from "@/shared/velora";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  useEffect(() => setQuery(params.q ?? ""), [params.q]);
  const { data } = trpc.marketplace.events.useQuery({ query: query || undefined });
  const results = data ?? DEMO_EVENTS.filter((event) => !query || `${event.title} ${event.artist} ${event.venue} ${event.city}`.toLowerCase().includes(query.toLowerCase())).map((event, index) => ({ ...event, id: index + 1, startsAt: new Date(event.date) }));
  return <AppShell><SafeAreaView style={styles.safe} edges={["top","left","right"]}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><View style={styles.header}><BrandMark /><Text style={styles.demo}>CATALOG SEARCH</Text></View><Text style={styles.title}>WHAT ARE YOU{`\n`}LOOKING FOR?</Text><View style={styles.search}><MaterialIcons name="search" color={PALETTE.ink} size={22}/><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Artist, team, event, venue or city" placeholderTextColor={PALETTE.muted} style={styles.input} returnKeyType="search"/></View><Text style={styles.note}>VÉLORA searches only the event records currently stored in its catalog.</Text>{query ? <View style={styles.results}>{results.length ? results.map((event) => <EventCard event={event} compact key={event.id}/>) : <EmptyState icon="travel-explore" title="Nothing verified yet" body="No VÉLORA event record matches that search. Try Dallas, Houston, Austin, San Antonio or a category."/>}</View> : <View style={styles.suggestions}><Text style={styles.suggestionHead}>TRY SEARCHING FOR</Text>{["Dallas concerts", "Houston", "Theater", "Austin experiences"].map((term) => <Pressable key={term} style={styles.suggestion} onPress={() => setQuery(term)}><Text style={styles.suggestionText}>{term}</Text><MaterialIcons name="north-east" size={18} color={PALETTE.ink}/></Pressable>)}</View>}</ScrollView></SafeAreaView></AppShell>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:PALETTE.cream},page:{padding:20,paddingBottom:108},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:58},demo:{fontSize:9,letterSpacing:1.1,fontWeight:"800",color:PALETTE.urgency},title:{fontFamily:"Georgia",fontSize:38,lineHeight:40,letterSpacing:-1,color:PALETTE.ink},search:{height:60,marginTop:28,backgroundColor:PALETTE.white,borderWidth:1,borderColor:PALETTE.ink,borderRadius:4,paddingHorizontal:16,flexDirection:"row",alignItems:"center"},input:{flex:1,marginLeft:11,fontSize:14,color:PALETTE.ink},note:{marginTop:11,color:PALETTE.muted,fontSize:11,lineHeight:16},results:{marginTop:30},suggestions:{marginTop:44},suggestionHead:{fontSize:10,fontWeight:"800",letterSpacing:1.1,color:PALETTE.champagne,marginBottom:9},suggestion:{minHeight:59,borderTopWidth:1,borderColor:PALETTE.border,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},suggestionText:{fontSize:17,fontFamily:"Georgia",color:PALETTE.ink}});
