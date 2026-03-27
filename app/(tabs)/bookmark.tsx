import { useRouter } from "expo-router";
import { Bookmark, ShieldCheck, Trash2 } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBookmarks } from "../../hooks/useBookmarks";
import { useAppContext } from "../../hooks/useAppContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarkScreen() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const router = useRouter();
  const { isDark, language } = useAppContext();

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, isDark && { backgroundColor: "#1A1A1A" }]}>
        <Bookmark size={48} color="#0047FF" />
      </View>
      <Text style={[styles.emptyTitle, isDark && { color: "white" }]}>
        {language === "HI" ? "आपकी लाइब्रेरी खाली है" : "Your Library is Empty"}
      </Text>
      <Text style={[styles.emptySubtitle, isDark && { color: "#555" }]}>
        {language === "HI"
          ? "बाद में पढ़ने के लिए रोचक समाचार सहेजें।"
          : "Save interesting news to read them later."}
      </Text>
      <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/")}>
        <Text style={styles.browseBtnText}>
          {language === "HI" ? "नवीनतम समाचार देखें" : "Browse Latest News"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, isDark && { backgroundColor: "#121212" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, isDark && { borderBottomColor: "#333" }]}>
        <Text style={[styles.headerTitle, isDark && { color: "white" }]}>
          {language === "HI" ? "मेरी लाइब्रेरी" : "My Library"}
        </Text>
        <Text style={[styles.headerSubtitle, isDark && { color: "#555" }]}>
          {bookmarks.length} {language === "HI" ? "सहेजी गई कहानियाँ" : "Saved Stories"}
        </Text>
      </View>

      {bookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.url}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, isDark && { backgroundColor: "#1A1A1A", borderColor: "#333" }]}
              onPress={() => router.push({ pathname: "/details", params: item as any })}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.sourceRow}>
                  <ShieldCheck size={12} color="#0047FF" />
                  <Text style={styles.sourceText}>{item.source?.toUpperCase()}</Text>
                </View>
                <Text style={[styles.cardTitle, isDark && { color: "white" }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={[styles.cardDate, isDark && { color: "#555" }]}>
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => removeBookmark(item.url)}>
                    <Trash2 size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#F2F2F7" },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1A1A1A" },
  headerSubtitle: { fontSize: 14, color: "#8E8E93", marginTop: 4, fontWeight: "500" },
  listContent: { padding: 20, paddingBottom: 100 },
  card: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 20, marginBottom: 16, padding: 12, borderWidth: 1, borderColor: "#F2F2F7", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  cardImage: { width: 90, height: 90, borderRadius: 16 },
  cardContent: { flex: 1, marginLeft: 16, justifyContent: "space-between" },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  sourceText: { fontSize: 10, fontWeight: "800", color: "#8E8E93" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", lineHeight: 22 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  cardDate: { fontSize: 12, color: "#8E8E93" },
  deleteBtn: { padding: 6, backgroundColor: "#FFF5F5", borderRadius: 10 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F0F5FF", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A", marginBottom: 10 },
  emptySubtitle: { fontSize: 15, color: "#8E8E93", textAlign: "center", lineHeight: 22, marginBottom: 30 },
  browseBtn: { backgroundColor: "#0047FF", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  browseBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
});
