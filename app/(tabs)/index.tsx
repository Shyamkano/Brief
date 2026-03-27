import { useRouter } from "expo-router";
import { Search, ShieldCheck, Sparkles, Zap, ArrowLeft, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNews } from "../../hooks/useNews";
import { searchArticles } from "../../services/news-api";
import { useAppContext, t } from "../../hooks/useAppContext";

const { width } = Dimensions.get("window");
const CATEGORIES = ["For You", "Tech", "Politics", "Sports", "Health"];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("For You");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const router = useRouter();
  const { language, isDark } = useAppContext();

  const { articles, loading, refetch } = useNews(selectedCategory);

  // Show search results when searching, otherwise show category articles
  const displayArticles = isSearching ? searchResults : articles;
  const isLoading = isSearching ? searchLoading : loading;

  const breakingNews = isSearching ? [] : articles.slice(0, 5);
  const topStories = isSearching ? searchResults : articles.slice(5);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    Keyboard.dismiss();
    try {
      const results = await searchArticles(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error("Search failed:", e);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    setSearchResults([]);
  };


  const ListHeader = () => (
    <View>
      {!isSearching && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive, isDark && styles.catChipDark]}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive, isDark && { color: "#AAA" }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isDark && { color: "white" }]}>
          {isSearching ? `${t('topStories', language)}: "${searchQuery}"` : t('breaking', language)}
        </Text>
      </View>

      {!isSearching && (
         <FlatList
         data={breakingNews}
         horizontal
         showsHorizontalScrollIndicator={false}
         pagingEnabled
         snapToAlignment="start"
         decelerationRate="fast"
         keyExtractor={(item, index) => `breaking-${index}`}
         renderItem={({ item }) => (
           <TouchableOpacity
             style={styles.storyCard}
             onPress={() => router.push({ pathname: "/details", params: { title: item.title, image: item.image, source: item.source, url: item.url, description: item.description || item.title } })}
           >
             <ImageBackground source={{ uri: item.image }} style={styles.breakingCard} imageStyle={{ borderRadius: 24 }}>
               <View style={styles.overlay}>
                 <View style={styles.liveBadge}><Text style={styles.liveText}>TRENDING</Text></View>
                 <Text style={styles.breakingTitle} numberOfLines={2}>{item.title}</Text>
                 <Text style={styles.breakingMeta}>{item.source} • {new Date(item.publishedAt).toLocaleDateString()}</Text>
               </View>
             </ImageBackground>
           </TouchableOpacity>
         )}
         style={styles.breakingList}
       />
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isDark && { color: "white" }]}>{t('topStories', language)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, isDark && { backgroundColor: "#121212", borderBottomColor: "#333" }]}>
        {isSearching ? (
          <View style={styles.searchBarContainer}>
            <TouchableOpacity onPress={clearSearch}>
              <ArrowLeft size={24} color={isDark ? "white" : "#1A1A1A"} />
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, isDark && { color: "white", backgroundColor: "#333" }]}
              placeholder={t('searchPlaceholder', language)}
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchLoading ? (
              <ActivityIndicator size="small" color="#0047FF" />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={20} color="#8E8E93" />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}><Zap color="white" size={18} fill="white" /></View>
              <Text style={[styles.logoText, isDark && { color: "white" }]}>Brief</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: "#333" }]} onPress={() => setIsSearching(true)}>
                <Search size={22} color={isDark ? "white" : "#1A1A1A"} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {(isSearching ? searchLoading : loading) && (isSearching ? searchResults : articles).length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#0047FF" /></View>
      ) : (
        <FlatList
          data={topStories}
          keyExtractor={(item, index) => `top-${index}`}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#0047FF" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.storyCard, isDark && styles.storyCardDark]}
              onPress={() => router.push({ pathname: "/details", params: { title: item.title, image: item.image, source: item.source, url: item.url, description: item.description || item.title } })}
            >
              <View style={styles.storyHeader}>
                <View style={styles.verifiedRow}><ShieldCheck size={14} color="#0047FF" /><Text style={styles.verifiedText}>{item.source.toUpperCase()}</Text></View>
                {item.image && <Image source={{ uri: item.image }} style={styles.storyThumb} />}
              </View>
              <Text style={[styles.storyTitle, isDark && { color: "white" }]} numberOfLines={2}>{item.title}</Text>
              <View style={styles.storyFooter}>
                <Text style={styles.sourceText}>Brief AI Verified</Text>
                <TouchableOpacity style={styles.aiButton}><Sparkles size={14} color="#0047FF" /><Text style={styles.aiButtonText}>AI Info</Text></TouchableOpacity>
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
  containerDark: { backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIcon: { backgroundColor: "#0047FF", padding: 6, borderRadius: 10 },
  logoText: { fontSize: 24, fontWeight: "800", color: "#1A1A1A" },
  headerIcons: { flexDirection: "row", gap: 12 },
  iconButton: { backgroundColor: "#F5F5F7", padding: 10, borderRadius: 50 },
  searchBarContainer: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  searchInput: { flex: 1, backgroundColor: "#F5F5F7", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, fontSize: 16, color: "#1A1A1A" },
  catScroll: { paddingLeft: 20, marginVertical: 15, maxHeight: 50 },
  catChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: "#F5F5F7", marginRight: 10 },
  catChipActive: { backgroundColor: "#0047FF" },
  catChipDark: { backgroundColor: "#333" },
  catText: { fontWeight: "600", color: "#666" },
  catTextActive: { color: "white" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 15, marginTop: 10, alignItems: "center" },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
  breakingList: { paddingLeft: 20, marginBottom: 20 },
  breakingCard: { width: width * 0.8, height: 200, marginRight: 15, overflow: "hidden" },
  overlay: { padding: 20, backgroundColor: "rgba(0,0,0,0.45)", height: "100%", justifyContent: "flex-end", borderRadius: 24 },
  liveBadge: { backgroundColor: "#FF3B30", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start", marginBottom: 10 },
  liveText: { color: "white", fontSize: 10, fontWeight: "900" },
  breakingTitle: { color: "white", fontSize: 18, fontWeight: "bold", lineHeight: 24 },
  storyCard: { backgroundColor: "white", marginHorizontal: 20, padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: "#F0F0F0" },
  storyCardDark: { backgroundColor: "#1A1A1A", borderColor: "#333" },
  storyHeader: { flexDirection: "row", justifyContent: "space-between" },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  verifiedText: { fontSize: 11, fontWeight: "800", color: "#8E8E93" },
  storyThumb: { width: 70, height: 70, borderRadius: 16 },
  storyTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A", width: "70%", lineHeight: 24 },
  storyFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15 },
  sourceText: { fontSize: 12, color: "#666", fontWeight: "500" },
  aiButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F0F4FF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  aiButtonText: { color: "#0047FF", fontWeight: "bold", fontSize: 12 },
});
