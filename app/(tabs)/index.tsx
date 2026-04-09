import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, ShieldCheck, Sparkles, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  Keyboard,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { t, useAppContext } from "../../hooks/useAppContext";
import { useNews } from "../../hooks/useNews";
import { searchArticles } from "../../services/news-api";

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
        <View style={{ marginBottom: 15 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScroll}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
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
        </View>
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
              activeOpacity={0.9}
              style={styles.breakingCardWrapper}
              onPress={() => router.push({ pathname: "/details", params: { title: item.title, image: item.image, source: item.source, url: item.url, description: item.description || item.title } })}
            >
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.breakingCard}
                imageStyle={{ borderRadius: 32 }}
              >
                <View style={styles.breakingOverlay}>
                  <BlurView intensity={30} tint="dark" style={styles.trendingBadge}>
                    <Sparkles size={12} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.trendingText}>TRENDING NOW</Text>
                  </BlurView>

                  <View style={styles.breakingContent}>
                    <Text style={styles.breakingSource}>{item.source.toUpperCase()}</Text>
                    <Text style={styles.breakingTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.breakingFooter}>
                      <Text style={styles.breakingMeta}>Intelligence Verified • {new Date(item.publishedAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
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
      <BlurView
        intensity={isDark ? 30 : 80}
        tint={isDark ? "dark" : "light"}
        style={[styles.header, isDark && { borderBottomColor: "#222" }]}
      >
        {isSearching ? (
          <View style={styles.searchBarContainer}>
            <TouchableOpacity onPress={clearSearch}>
              <ArrowLeft size={24} color={isDark ? "white" : "#1A1A1A"} />
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, isDark && { color: "white", backgroundColor: "#222" }]}
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
              <View style={styles.logoIcon}>
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
              <Text style={[styles.logoText, isDark && { color: "white" }]}>Brief</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={[styles.iconButton, isDark && { backgroundColor: "#222" }]}
                onPress={() => setIsSearching(true)}
              >
                <Search size={22} color={isDark ? "white" : "#1A1A1A"} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </BlurView>

      {(isSearching ? searchLoading : loading) && (isSearching ? searchResults : articles).length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#0047FF" /></View>
      ) : (
        <FlatList
          data={topStories}
          keyExtractor={(item, index) => `top-${index}`}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#0047FF" />}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.storyCardWrapper}
                onPress={() => router.push({ pathname: "/details", params: { title: item.title, image: item.image, source: item.source, url: item.url, description: item.description || item.title } })}
              >
                <ImageBackground
                  source={{ uri: item.image }}
                  style={styles.storyCardImage}
                  imageStyle={{ borderRadius: 28 }}
                >
                  <View style={styles.storyOverlay}>
                    <View style={styles.storyHeaderTop}>
                      <BlurView intensity={20} tint="dark" style={styles.sourceBadge}>
                        <ShieldCheck size={12} color="#0047FF" />
                        <Text style={styles.sourceBadgeText}>{item.source.toUpperCase()}</Text>
                      </BlurView>
                    </View>

                    <View style={styles.storyContent}>
                      <Text style={styles.storyTitleOverlay} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.storyFooterOverlay}>
                        <Text style={styles.storyFooterText}>Brief AI Verified</Text>
                        <Sparkles size={14} color="#0047FF" />
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </Animated.View>
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
  logoIcon: { backgroundColor: "transparent", padding: 0, borderRadius: 0 },
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
  breakingList: { paddingLeft: 20, marginBottom: 30, marginTop: 10 },
  breakingCardWrapper: {
    width: width * 0.85,
    height: 240,
    marginRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  breakingCard: { flex: 1, backgroundColor: '#333', borderRadius: 32 },
  breakingOverlay: {
    flex: 1,
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "space-between",
    borderRadius: 32
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  trendingText: { color: "white", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  breakingContent: { gap: 8 },
  breakingSource: { color: "#0047FF", fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  breakingTitle: { color: "white", fontSize: 22, fontWeight: "900", lineHeight: 28, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  breakingFooter: { marginTop: 4 },
  breakingMeta: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },
  storyCardWrapper: {
    marginHorizontal: 20,
    height: 180,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  storyCardImage: { flex: 1, backgroundColor: '#333', borderRadius: 28 },
  storyOverlay: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    borderRadius: 28
  },
  storyHeaderTop: { alignSelf: 'flex-start' },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  sourceBadgeText: { color: "white", fontSize: 10, fontWeight: "800" },
  storyContent: { gap: 6 },
  storyTitleOverlay: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  storyFooterOverlay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  storyFooterText: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "500" },
});
