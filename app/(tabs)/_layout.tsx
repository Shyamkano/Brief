import { Tabs } from "expo-router";
import { Bookmark, Home, Settings, ShieldCheck } from "lucide-react-native";
import { useAppContext } from "../../hooks/useAppContext";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";

export default function TabLayout() {
  const { isDark } = useAppContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0047FF",
        tabBarInactiveTintColor: isDark ? "#888" : "#8E8E93",
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? "rgba(18, 18, 18, 0.6)" : "rgba(255, 255, 255, 0.6)",
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={isDark ? 30 : 80} 
            tint={isDark ? "dark" : "light"} 
            style={{ flex: 1 }} 
          />
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 0.5,
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
        headerStyle: {
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 22,
          color: isDark ? "#FFFFFF" : "#1A1A1A",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Brief",
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="verify"
        options={{
          title: "Verify",
          headerShown: false,
          tabBarLabel: "Verify",
          tabBarIcon: ({ color }) => <ShieldCheck size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmark"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarLabel: "Saved",
          tabBarIcon: ({ color }) => <Bookmark size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
