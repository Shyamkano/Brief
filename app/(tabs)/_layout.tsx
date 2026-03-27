import { Tabs } from "expo-router";
import { Bookmark, Home, Settings, ShieldCheck } from "lucide-react-native";
import { useAppContext } from "../../hooks/useAppContext";

export default function TabLayout() {
  const { isDark } = useAppContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0047FF",
        tabBarInactiveTintColor: isDark ? "#555" : "#8E8E93",
        tabBarStyle: {
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#333" : "#E5E5EA",
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
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
