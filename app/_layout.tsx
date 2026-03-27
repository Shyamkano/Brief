import { Stack } from "expo-router";
import { BookmarkProvider } from "../hooks/useBookmarks";
import { AppProvider } from "../hooks/useAppContext";

export default function RootLayout() {
  return (
    <AppProvider>
      <BookmarkProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="details" />
        </Stack>
      </BookmarkProvider>
    </AppProvider>
  );
}
