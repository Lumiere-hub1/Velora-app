import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppShell, BrandMark, EmptyState, EventCard, PALETTE, ScreenLoading } from "@/components/velora-ui";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function SavedScreen() {
  const auth=useAuth();
  const saved=trpc.account.saved.useQuery(undefined,{enabled:auth.isAuthenticated});
  return <AppShell><SafeAreaView style={styles.safe} edges={["top","left","right"]}><ScrollView contentContainerStyle={styles.page}><View style={styles.header}><BrandMark/><Text style={styles.kicker}>YOUR COLLECTION</Text></View><Text style={styles.title}>SAVED{`\n`}EXPERIENCES.</Text><Text style={styles.copy}>Keep the events you want to revisit close at hand. Saved events require a VÉLORA account.</Text>{auth.loading||saved.isLoading?<ScreenLoading/>:!auth.isAuthenticated?<View style={styles.gap}><EmptyState icon="bookmark-border" title="Save your favorites" body="Sign in to build a personal VÉLORA collection across your devices." actionLabel="GO TO ACCOUNT" onAction={()=>router.push("/(tabs)/account" as any)}/></View>:saved.data?.length?<View style={styles.list}>{saved.data.map((event)=><EventCard compact event={{...event,fromPrice:null}} key={event.id}/>)}</View>:<View style={styles.gap}><EmptyState icon="bookmark-border" title="Nothing saved yet" body="Open any event and save it to keep the record in your collection." actionLabel="EXPLORE EVENTS" onAction={()=>router.push("/(tabs)/events" as any)}/></View>}</ScrollView></SafeAreaView></AppShell>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:PALETTE.cream},page:{padding:20,paddingBottom:110},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:46},kicker:{fontSize:9,color:PALETTE.muted,fontWeight:"800",letterSpacing:1.1},title:{fontSize:39,lineHeight:40,letterSpacing:-1,fontFamily:"Georgia",color:PALETTE.ink},copy:{marginTop:15,maxWidth:310,fontSize:13,lineHeight:19,color:PALETTE.muted},gap:{marginTop:50},list:{marginTop:37}});
