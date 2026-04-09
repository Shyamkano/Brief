import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
    Bookmark,
    ChevronLeft,
    ExternalLink,
    Share2,
    ShieldCheck,
    Sparkles,
    Type,
    Zap,
    Scale,
    MessageSquare,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Share,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDeepAnalysis, DeepAnalysisResult } from "../services/ai-service";
import { useBookmarks } from "../hooks/useBookmarks";
import { useAppContext, t } from "../hooks/useAppContext";
import ChatDrawer from "../components/ChatDrawer";
import { BlurView } from "expo-blur";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { language, isDark, setLanguage } = useAppContext();

  const [fontSize, setFontSize] = useState(16);
  const [loadingAI, setLoadingAI] = useState(true);
  const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [activeLens, setActiveLens] = useState<"neutral" | "left" | "right">("neutral");
  const [showChat, setShowChat] = useState(false);

  const articleURL = params.url as string;
  const bookmarked = isBookmarked(articleURL);

  useEffect(() => {
    if (params.title) fetchAnalysis();
  }, [language, params.title]);

  const fetchAnalysis = async () => {
    setLoadingAI(true);
    const result = await getDeepAnalysis(params.title as string, (params.description as string) || (params.title as string), language);
    setAnalysis(result);
    setLoadingAI(false);
  };

  const handleOpenFullArticle = async () => {
    if (params.url) await WebBrowser.openBrowserAsync(params.url as string);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && { backgroundColor: "#121212" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={[styles.topNav, isDark && { backgroundColor: "#121212", borderBottomColor: "#333" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={isDark ? "white" : "#1A1A1A"} size={28} />
        </TouchableOpacity>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, language === "EN" && styles.toggleActive]}
            onPress={() => setLanguage("EN")}
          >
            <Text style={[styles.toggleText, language === "EN" && styles.textActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, language === "HI" && styles.toggleActive]}
            onPress={() => setLanguage("HI")}
          >
            <Text style={[styles.toggleText, language === "HI" && styles.textActive]}>हिं</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity><Type color="#0047FF" size={24} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <Image source={{ uri: (params.image as string) || "https://images.unsplash.com/photo-1504711434969-e33886168f5c" }} style={styles.heroImage} />

        <View style={[styles.body, isDark && { backgroundColor: "#121212" }]}>
          <View style={styles.categoryBadge}><Text style={styles.categoryText}>{params.source?.toString().toUpperCase() || "NEWS"}</Text></View>
          <Text style={[styles.title, isDark && { color: "white" }]}>{params.title}</Text>

          <View style={styles.authorRow}>
            <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitials}>{((params.source as string) || "B")[0]}</Text></View>
            <View style={styles.authorInfo}>
              <View style={styles.authorNameRow}><Text style={[styles.authorName, isDark && { color: "white" }]}>{params.source}</Text><ShieldCheck size={14} color="#0047FF" /></View>
              <Text style={styles.dateText}>Brief Intelligence Engine • {language}</Text>
            </View>
            <View style={styles.actionIcons}>
              <TouchableOpacity style={[styles.circleBtn, isDark && { backgroundColor: "#333" }]} onPress={() => Share.share({ message: params.url as string })}><Share2 size={18} color="#555" /></TouchableOpacity>
              <TouchableOpacity style={[styles.circleBtn, isDark && { backgroundColor: "#333" }]} onPress={() => bookmarked ? removeBookmark(articleURL) : addBookmark({ title: params.title as string, description: params.description as string, url: params.url as string, image: params.image as string, source: params.source as string, publishedAt: new Date().toISOString() })}><Bookmark size={18} color={bookmarked ? "#0047FF" : "#555"} fill={bookmarked ? "#0047FF" : "transparent"} /></TouchableOpacity>
            </View>
          </View>

          {loadingAI ? (
            <View style={styles.loadingContainer}><ActivityIndicator color="#0047FF" size="large" /><Text style={styles.loadingText}>Synthesizing Intelligence...</Text></View>
          ) : analysis && (
            <>
              <View style={[styles.impactBox, isDark && { backgroundColor: "#1A1A00", borderColor: "#555" }]}>
                <View style={styles.impactHeader}><Zap size={16} color="#0047FF" fill="#0047FF" /><Text style={styles.impactTitle}>{t('impactTitle', language)}</Text></View>
                <Text style={[styles.impactText, isDark && { color: "#CCC" }, { fontSize: fontSize-1 }]}>{analysis.impact}</Text>
              </View>

              <View style={[styles.lensBox, isDark && { backgroundColor: "#1A1A1A", borderColor: "#333" }]}>
                <View style={[styles.lensHeader, isDark && { borderBottomColor: "#333" }]}><Scale size={18} color="#0047FF" /><Text style={[styles.lensTitle, isDark && { color: "white" }]}>{t('lensTitle', language)}</Text></View>
                <View style={[styles.lensTabs, isDark && { backgroundColor: "#222" }]}>
                  {["left", "neutral", "right"].map((l: any) => (
                    <TouchableOpacity key={l} style={[styles.lensTab, activeLens === l && styles.lensTabActive, isDark && activeLens === l && { backgroundColor: "#333" }]} onPress={() => setActiveLens(l)}>
                      <Text style={[styles.lensTabText, activeLens === l && styles.lensTabTextActive]}>{l.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.lensContent}><Text style={[styles.lensText, isDark && { color: "#AAA" }, { fontSize: fontSize-1 }]}>{analysis.lenses[`${activeLens}_view` as keyof typeof analysis.lenses]}</Text></View>
              </View>

              <View style={[styles.aiBox, isDark && { backgroundColor: "#001A33", borderLeftColor: "#0047FF" }]}>
                <View style={[styles.aiHeader, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Sparkles size={16} color="#0047FF" /><Text style={styles.aiHeaderText}>{t('aiSummary', language)}</Text></View>
                  <TouchableOpacity style={styles.chatBadge} onPress={() => setShowChat(true)}><MessageSquare size={12} color="white" /><Text style={styles.chatBadgeText}>{t('askAI', language)}</Text></TouchableOpacity>
                </View>
                {analysis.summary.map((p, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={[styles.bulletContent, styles.aiFont, isDark && { color: "#BBB" }, { fontSize }]}>
                      {p.replace("•", "").trim()}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.fullArticleBtn} onPress={handleOpenFullArticle}><Text style={styles.fullArticleBtnText}>Verify Original Source</Text><ExternalLink size={18} color="white" /></TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <BlurView
        intensity={isDark ? 30 : 90}
        tint={isDark ? "dark" : "light"}
        style={[styles.sliderContainer, isDark && { borderTopColor: "#333" }]}
      >
        <Text style={{ fontSize: 12, color: isDark ? "#AAA" : "#666" }}>A</Text>
        <Slider style={{ flex: 1, height: 40 }} minimumValue={14} maximumValue={26} step={2} value={fontSize} onValueChange={setFontSize} minimumTrackTintColor="#0047FF" thumbTintColor="#0047FF" />
        <Text style={{ fontSize: 22, color: isDark ? "#FFF" : "#000" }}>A</Text>
      </BlurView>

      <ChatDrawer isVisible={showChat} onClose={() => setShowChat(false)} articleTitle={params.title as string} articleContent={(params.description as string) || (params.title as string)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  topNav: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, alignItems: "center", height: 60, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  toggleContainer: { flexDirection: "row", backgroundColor: "#F0F0F5", borderRadius: 20, padding: 2, width: 100, justifyContent: "space-between" },
  toggleBtn: { flex: 1, alignItems: "center", paddingVertical: 5, borderRadius: 18 },
  toggleActive: { backgroundColor: "white", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2 },
  toggleText: { fontSize: 11, fontWeight: "bold", color: "#8E8E93" },
  textActive: { color: "#0047FF" },
  backBtn: { padding: 5 },
  heroImage: { width: "100%", height: 260 },
  body: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, backgroundColor: "white" },
  categoryBadge: { backgroundColor: "#0047FF", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 15 },
  categoryText: { color: "white", fontSize: 10, fontWeight: "900" },
  title: { fontSize: 24, fontWeight: "800", color: "#1A1A1A", lineHeight: 32, marginBottom: 20 },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#0047FF", justifyContent: "center", alignItems: "center" },
  avatarInitials: { color: "white", fontWeight: "bold", fontSize: 18 },
  authorInfo: { flex: 1, marginLeft: 12 },
  authorNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  authorName: { fontWeight: "700", fontSize: 15 },
  dateText: { color: "#8E8E93", fontSize: 12 },
  actionIcons: { flexDirection: "row", gap: 10 },
  circleBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F2F2F7", justifyContent: "center", alignItems: "center" },
  aiBox: { backgroundColor: "#F0F5FF", padding: 20, borderRadius: 24, borderLeftWidth: 5, borderLeftColor: "#0047FF", marginBottom: 25 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  aiHeaderText: { fontSize: 13, fontWeight: "900", color: "#0047FF", letterSpacing: 0.5 },
  chatBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#0047FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  chatBadgeText: { color: "white", fontSize: 11, fontWeight: "800" },
  bulletRow: { flexDirection: "row", marginBottom: 12 },
  bullet: { color: "#0047FF", fontSize: 20, marginRight: 10 },
  bulletContent: { flex: 1, color: "#333", lineHeight: 26 },
  aiFont: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
    letterSpacing: -0.3
  },
  loadingContainer: { padding: 40, alignItems: "center" },
  loadingText: { marginTop: 15, color: "#8E8E93", fontWeight: "600" },
  impactBox: { backgroundColor: "#FFF9E6", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "#FFE58F", marginBottom: 25 },
  impactHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  impactTitle: { fontSize: 13, fontWeight: "900", color: "#B78103", letterSpacing: 0.5 },
  impactText: { fontSize: 15, color: "#594000", lineHeight: 22, fontWeight: "600" },
  lensBox: { backgroundColor: "white", borderRadius: 24, borderWidth: 1, borderColor: "#F0F0F0", marginBottom: 25, overflow: "hidden" },
  lensHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  lensTitle: { fontSize: 13, fontWeight: "900", color: "#1A1A1A", letterSpacing: 0.5 },
  lensTabs: { flexDirection: "row", backgroundColor: "#F9F9F9" },
  lensTab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  lensTabActive: { backgroundColor: "white", borderBottomWidth: 2, borderBottomColor: "#0047FF" },
  lensTabText: { fontSize: 12, fontWeight: "600", color: "#8E8E93" },
  lensTabTextActive: { color: "#0047FF" },
  lensContent: { padding: 20 },
  lensText: { fontSize: 15, color: "#333", lineHeight: 24 },
  fullArticleBtn: { backgroundColor: "#0047FF", flexDirection: "row", padding: 18, borderRadius: 20, justifyContent: "center", alignItems: "center", gap: 10 },
  fullArticleBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  sliderContainer: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "white", padding: 20, flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#EEE", paddingBottom: 35 },
});
