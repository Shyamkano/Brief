import { AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { verifyNewsHeadline, VerificationResult } from "../../services/ai-service";
import { searchNews } from "../../services/news-api";
import { useAppContext } from "../../hooks/useAppContext";
import { SafeAreaView } from "react-native-safe-area-context";

interface HistoryItem extends VerificationResult {
  id: string;
  query: string;
}

export default function VerifyScreen() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { isDark, language } = useAppContext();

  const handleVerify = async () => {
    if (!query.trim()) return;
    setLoading(true);
    Keyboard.dismiss();
    try {
      const context = await searchNews(query);
      const result = await verifyNewsHeadline(query, context);
      setHistory([{ ...result, id: Date.now().toString(), query }, ...history]);
      setQuery("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, isDark && { backgroundColor: "#121212" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.aiBadge}>
            <Sparkles size={14} color="#0047FF" />
            <Text style={styles.aiBadgeText}>BRIEF AI PROTECT</Text>
          </View>
          <Text style={[styles.title, isDark && { color: "white" }]}>
            {language === "HI" ? "समाचार सत्यापन" : "Fact Check & Verify"}
          </Text>
          <Text style={[styles.subtitle, isDark && { color: "#888" }]}>
            {language === "HI"
              ? "समाचार शीर्षक या लिंक पेस्ट करें, हमारा AI सत्यापित करेगा।"
              : "Paste a headline or URL to verify authenticity using multi-vector AI analysis."}
          </Text>
        </View>

        {/* Input */}
        <View style={[styles.inputContainer, isDark && { backgroundColor: "#1A1A1A", borderColor: "#333" }]}>
          <TextInput
            style={[styles.input, isDark && { color: "white" }]}
            placeholder={language === "HI" ? "समाचार शीर्षक या URL यहाँ पेस्ट करें..." : "Paste news headline or URL here..."}
            placeholderTextColor={isDark ? "#555" : "#8E8E93"}
            value={query}
            onChangeText={setQuery}
            multiline
          />
          <TouchableOpacity
            style={[styles.verifyBtn, (!query.trim() || loading) && styles.disabledBtn]}
            onPress={handleVerify}
            disabled={!query.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <ShieldCheck size={20} color="white" />
                <Text style={styles.verifyBtnText}>
                  {language === "HI" ? "सत्यापित करें" : "Verify Sources"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: "white" }]}>
            {language === "HI" ? "सत्यापन इतिहास" : "Verification History"}
          </Text>
          {history.length === 0 && !loading && (
            <Text style={[styles.emptyText, isDark && { color: "#555" }]}>
              {language === "HI" ? "कोई हालिया जाँच नहीं।" : "No recent checks. Paste something above to start."}
            </Text>
          )}
          {history.map((check) => (
            <View key={check.id} style={[styles.checkCard, isDark && { backgroundColor: "#1A1A1A", borderColor: "#333" }]}>
              <View style={styles.checkHeader}>
                <View style={[styles.statusBadge, { backgroundColor: check.status === "Verified" ? "#E1F9EB" : check.status === "Suspect" ? "#FFF9E1" : "#FFF5F5" }]}>
                  {check.status === "Verified"
                    ? <CheckCircle2 size={12} color="#27AE60" />
                    : <AlertCircle size={12} color={check.status === "Suspect" ? "#F2994A" : "#FF3B30"} />}
                  <Text style={[styles.statusText, { color: check.status === "Verified" ? "#27AE60" : check.status === "Suspect" ? "#F2994A" : "#FF3B30" }]}>
                    {check.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.scoreText, isDark && { color: "#888" }]}>
                  Trust: {check.score}%
                </Text>
              </View>
              <Text style={[styles.checkQuery, isDark && { color: "#CCC" }]}>"{check.query}"</Text>
              <Text style={[styles.checkReason, isDark && { color: "#888" }]}>{check.reason}</Text>
              <View style={[styles.progressBarBg, isDark && { backgroundColor: "#333" }]}>
                <View style={[styles.progressBarFill, { width: `${check.score}%`, backgroundColor: check.score > 70 ? "#27AE60" : check.score > 40 ? "#FFCC00" : "#FF3B30" }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.infoBox, isDark && { backgroundColor: "#001A33" }]}>
          <AlertCircle size={20} color="#0047FF" />
          <Text style={[styles.infoText, isDark && { color: "#AAA" }]}>
            {language === "HI"
              ? "हमारा AI 500+ वैश्विक स्रोतों से क्रॉस-रेफरेंस करता है।"
              : "Our AI analyzes cross-references from 500+ global verified sources."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 30 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F0F5FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start", marginBottom: 12 },
  aiBadgeText: { fontSize: 10, fontWeight: "900", color: "#0047FF", letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: "800", color: "#1A1A1A", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#666", lineHeight: 22 },
  inputContainer: { backgroundColor: "#F8F8F8", borderRadius: 24, padding: 16, borderWidth: 1, borderColor: "#EEE", marginBottom: 30 },
  input: { fontSize: 16, color: "#1A1A1A", minHeight: 80, textAlignVertical: "top", marginBottom: 16 },
  verifyBtn: { backgroundColor: "#0047FF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16, elevation: 4 },
  disabledBtn: { backgroundColor: "#A0B5FF", elevation: 0 },
  verifyBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 16 },
  emptyText: { color: "#8E8E93", textAlign: "center", marginVertical: 20, fontSize: 14 },
  checkCard: { backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#F2F2F7" },
  checkHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "900" },
  scoreText: { fontSize: 12, fontWeight: "600", color: "#8E8E93" },
  checkQuery: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 6, fontStyle: "italic" },
  checkReason: { fontSize: 14, color: "#444", marginBottom: 12, lineHeight: 20 },
  progressBarBg: { height: 6, backgroundColor: "#F2F2F7", borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  infoBox: { flexDirection: "row", backgroundColor: "#F0F5FF", padding: 20, borderRadius: 24, gap: 15, alignItems: "center" },
  infoText: { flex: 1, fontSize: 14, color: "#333", lineHeight: 20, fontWeight: "500" },
});
