import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import React, { useState, useRef, useEffect } from "react"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"

// Define the type for chat messages
interface ChatMessage {
  id: number
  text: string
  isBot: boolean
}

export default function HomeScreen() {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! How can I help you today?", isBot: true },
  ])

  // Fix the ref type
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    // Scroll to bottom whenever chat history changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [chatHistory])

  const sendMessage = () => {
    if (message.trim() === "") return

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: chatHistory.length + 1,
      text: message,
      isBot: false,
    }

    setChatHistory([...chatHistory, newUserMessage])
    setMessage("")

    // Mock response (placeholder for API integration)
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: chatHistory.length + 2,
        text: "This is a placeholder response. API integration will be added later.",
        isBot: true,
      }
      setChatHistory((prevChat) => [...prevChat, botResponse])
    }, 1000)
  }

  // Fix the parameter type
  const renderChatBubble = (item: ChatMessage) => {
    return (
      <ThemedView
        key={item.id}
        style={[
          styles.chatBubble,
          item.isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        {item.isBot && (
          <IconSymbol
            size={18}
            name="bubble.left.fill"
            color="#4F8EF7"
            style={styles.botIcon}
          />
        )}
        <ThemedText style={item.isBot ? styles.botText : styles.userText}>
          {item.text}
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Chat Assistant</ThemedText>
      </ThemedView>

      <ThemedView style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatHistory}
          contentContainerStyle={styles.chatHistoryContent}
        >
          {chatHistory.map((item) => renderChatBubble(item))}
        </ScrollView>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={message.trim() === ""}
          >
            <IconSymbol size={24} name="paperplane.fill" color="#FFFFFF" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Add padding for status bar
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  chatContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  chatHistory: {
    flex: 1,
  },
  chatHistoryContent: {
    padding: 16,
    paddingBottom: 24,
  },
  chatBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e1f5fe",
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#e3f2fd",
    borderBottomRightRadius: 4,
  },
  botIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  botText: {
    color: "#000",
    flex: 1,
  },
  userText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#4F8EF7",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
})
