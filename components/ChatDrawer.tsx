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
import { Send, X, Bot, Sparkles } from "lucide-react-native";
import { getChatResponse } from "../services/ai-service";
import { useAppContext } from "../hooks/useAppContext";

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

    try {
      const response = await getChatResponse(inputText, `Title: ${articleTitle}\nContent: ${articleContent}`);
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

  const bg = isDark ? "#121212" : "white";
  const cardBg = isDark ? "#1A1A1A" : "#F2F2F7";
  const borderColor = isDark ? "#333" : "#F2F2F7";
  const textColor = isDark ? "white" : "#1A1A1A";
  const subColor = isDark ? "#888" : "#8E8E93";
  const inputBg = isDark ? "#2A2A2A" : "#F8F8F8";

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.container, { backgroundColor: bg }]}
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
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
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
                  msg.sender === "user" ? styles.userText : { color: textColor }
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: cardBg }]}>
                <ActivityIndicator size="small" color="#0047FF" />
              </View>
            )}
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
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.disabledSend]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: {
    height: "82%",
    width: "100%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
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
  aiBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4, flexDirection: "row", gap: 8 },
  messageText: { fontSize: 15, lineHeight: 22, flexShrink: 1 },
  userText: { color: "white", fontWeight: "500" },
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
