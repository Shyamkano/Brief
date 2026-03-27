import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  Bell, 
  ChevronRight, 
  Globe, 
  Moon, 
  Shield, 
  Zap,
  Lock,
  ExternalLink,
  Github,
  Info
} from "lucide-react-native";
import { useAppContext, t } from "../../hooks/useAppContext";

export default function SettingsScreen() {
  const { language, setLanguage, theme, toggleTheme, isDark } = useAppContext();

  const handleLanguageToggle = () => {
    Alert.alert(
      language === "EN" ? "Switch to Hindi?" : "अंग्रेजी में बदलें?",
      language === "EN" ? "Content will be shown in Hindi." : "कंटेंट अंग्रेजी में दिखाया जाएगा।",
      [
        { text: language === "EN" ? "Hindi (हिन्दी)" : "English", onPress: () => setLanguage(language === "EN" ? "HI" : "EN") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, value, onPress, type = "link" }: any) => (
    <TouchableOpacity style={[styles.item, isDark && styles.itemDark]} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, isDark && { backgroundColor: "#333" }]}>
          <Icon size={20} color="#0047FF" />
        </View>
        <Text style={[styles.itemTitle, isDark && { color: "white" }]}>{title}</Text>
      </View>
      <View style={styles.itemRight}>
        {type === "link" && (
          <>
            {value && <Text style={styles.itemValue}>{value}</Text>}
            <ChevronRight size={18} color="#8E8E93" />
          </>
        )}
        {type === "switch" && (
          <Switch 
            value={title === t('darkMode', language) ? isDark : true} 
            onValueChange={title === t('darkMode', language) ? toggleTheme : () => {}}
            trackColor={{ false: "#D1D1D6", true: "#0047FF" }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, isDark && { backgroundColor: "#121212" }]}>
        <Text style={[styles.headerTitle, isDark && { color: "white" }]}>{t('settings', language)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.guestCard, isDark && styles.guestCardDark]}>
          <View style={styles.guestIcon}><Lock size={24} color="#0047FF" /></View>
          <View style={styles.guestInfo}>
            <Text style={styles.guestLabel}>{t('privateMode', language)}</Text>
            <Text style={[styles.guestTitle, isDark && { color: "white" }]}>Local Intelligence</Text>
            <Text style={styles.guestSub}>Stored in app cache only. No login required.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{language === "EN" ? "PREFERENCES" : "पसंदीदा"}</Text>
          <SettingItem icon={Globe} title={t('language', language)} value={language === "EN" ? "English" : "हिन्दी"} onPress={handleLanguageToggle} />
          <SettingItem icon={Moon} title={t('darkMode', language)} type="switch" />
          <SettingItem icon={Bell} title={t('notifications', language)} type="switch" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{language === "EN" ? "AI & SECURITY" : "एआई और सुरक्षा"}</Text>
          <SettingItem icon={Zap} title="AI Analysis Depth" value="Strict" />
          <SettingItem icon={Shield} title="Fact Check Precision" value="High" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>BRIEF APP</Text>
          <SettingItem icon={Github} title="Brief Open Source" />
          <SettingItem icon={Info} title="Version 1.2.5" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  containerDark: { backgroundColor: "#121212" },
  header: { padding: 20, paddingTop: 10, backgroundColor: "white" },
  headerTitle: { fontSize: 28, fontWeight: "900", color: "#1A1A1A" },
  scrollContent: { paddingBottom: 100 },
  guestCard: { margin: 20, backgroundColor: "white", padding: 20, borderRadius: 24, flexDirection: "row", gap: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  guestCardDark: { backgroundColor: "#1A1A1A", borderColor: "#333" },
  guestIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F0F5FF", alignItems: "center", justifyContent: "center" },
  guestInfo: { flex: 1 },
  guestLabel: { fontSize: 10, fontWeight: "900", color: "#0047FF", letterSpacing: 1 },
  guestTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A", marginTop: 2 },
  guestSub: { fontSize: 13, color: "#6B7280", marginTop: 4, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 12, fontWeight: "900", color: "#9CA3AF", paddingHorizontal: 20, marginBottom: 8, letterSpacing: 1 },
  item: { flexDirection: "row", backgroundColor: "white", paddingVertical: 16, paddingHorizontal: 20, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  itemDark: { backgroundColor: "#1A1A1A", borderBottomColor: "#333" },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemValue: { fontSize: 14, color: "#6B7280" },
});
