import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Send, X, Bot, Sparkles, MessageSquare } from "lucide-react-native";
import { getChatResponse } from "../services/ai-service";
import { useAppContext } from "../hooks/useAppContext";
import * as Haptics from "expo-haptics";
import Animated, { 
  FadeInUp, 
  FadeOutDown, 
  Layout, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

interface ChatDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  articleTitle: string;
  articleContent: string;
}

export default function ChatDrawer({ isVisible, onClose, articleTitle, articleContent }: ChatDrawerProps) {
  const { isDark, language } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: language === "HI"
        ? `नमस्ते! मैं Brief AI हूँ। मैंने "${articleTitle}" का विश्लेषण किया है। इस खबर के बारे में कुछ भी पूछें!`
        : `Hi! I'm Brief AI. I've analyzed "${articleTitle}". Ask me anything about this story!`,
      sender: "ai",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await getChatResponse(inputText, `Title: ${articleTitle}\nContent: ${articleContent}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "ai",
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const animatedScale = useSharedValue(1);
  const sendBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(inputText.trim() ? 1 : 0.8) }],
    opacity: withTiming(inputText.trim() ? 1 : 0.6)
  }));

  const bg = isDark ? "rgba(18, 18, 18, 0.75)" : "rgba(255, 255, 255, 0.75)";
  const cardBg = isDark ? "rgba(42, 42, 42, 0.6)" : "rgba(242, 242, 247, 0.8)";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
  const textColor = isDark ? "white" : "#1A1A1A";
  const subColor = isDark ? "#A0A0A0" : "#8E8E93";
  const inputBg = isDark ? "#2A2A2A" : "#F2F2F7";

  const TypingIndicator = () => (
    <Animated.View 
      entering={FadeInUp.springify()} 
      style={[styles.messageBubble, styles.aiBubble, { backgroundColor: cardBg, width: 80, justifyContent: 'center' }]}
    >
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 200} />
        ))}
      </View>
    </Animated.View>
  );

  const Dot = ({ delay }: { delay: number }) => {
    const opacity = useSharedValue(0.4);
    
    useEffect(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 450 }),
          withTiming(0.4, { duration: 450 })
        ),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: withSpring(opacity.value + 0.2) }]
    }));

    return <Animated.View style={[styles.dot, animatedStyle]} />;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 70 : 85}
          tint={isDark ? "dark" : "light"}
          style={[styles.container, { backgroundColor: bg }]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
          {/* Handle bar */}
          <View style={styles.handleBar}>
            <View style={[styles.handle, isDark && { backgroundColor: "#444" }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <View style={styles.headerTitleContainer}>
              <View style={styles.botIcon}>
                <Bot size={18} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: textColor }]}>Brief AI Assistant</Text>
                <Text style={[styles.headerSubtitle, { color: subColor }]} numberOfLines={1}>
                  {articleTitle}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: cardBg }]}>
              <X size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => (
              <Animated.View
                key={msg.id}
                entering={FadeInUp.delay(index * 50).springify()}
                layout={Layout.springify()}
                style={[
                  styles.messageBubble,
                  msg.sender === "user"
                    ? styles.userBubble
                    : [styles.aiBubble, { backgroundColor: cardBg }],
                ]}
              >
                {msg.sender === "ai" && (
                  <Sparkles size={12} color="#0047FF" style={{ marginTop: 4 }} />
                )}
                <Text style={[
                  styles.messageText,
                  msg.sender === "user" ? styles.userText : [styles.aiText, { color: textColor }]
                ]}>
                  {msg.text}
                </Text>
              </Animated.View>
            ))}
            {loading && <TypingIndicator />}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputArea, { borderTopColor: borderColor }]}>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              placeholder={language === "HI" ? "कोई प्रश्न पूछें..." : "Ask a question..."}
              placeholderTextColor={subColor}
              value={inputText}
              onChangeText={setInputText}
              multiline
              blurOnSubmit={true}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <AnimatedTouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.disabledSend, sendBtnStyle]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={20} color="white" />
            </AnimatedTouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  container: {
    height: "82%",
    width: "100%",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#0047FF" },
  handleBar: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D1D6" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleContainer: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  botIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#0047FF", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  headerSubtitle: { fontSize: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  messagesList: { flex: 1 },
  messagesContent: { padding: 20, paddingBottom: 40 },
  messageBubble: { padding: 14, borderRadius: 20, marginBottom: 12, maxWidth: "85%" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#0047FF", borderBottomRightRadius: 4 },
  aiBubble: { 
    alignSelf: "flex-start", 
    borderBottomLeftRadius: 4, 
    flexDirection: "row", 
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 71, 255, 0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  messageText: { fontSize: 16, lineHeight: 24, flexShrink: 1 },
  userText: { color: "white", fontWeight: "600" },
  aiText: { 
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
    letterSpacing: -0.2
  },
  inputArea: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0047FF",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledSend: { backgroundColor: "#A0B5FF" },
});
