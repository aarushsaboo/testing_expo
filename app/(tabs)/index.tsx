import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native"
import React, { useState, useRef, useEffect } from "react"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import Constants from "expo-constants"

// Define the type for chat messages
interface ChatMessage {
  id: number
  text: string
  isBot: boolean
}

// Safely access the API key with type checking
const GEMINI_API_KEY =
  Constants.expoConfig?.extra?.geminiApiKey // Replace with your actual API key or fallback

export default function HomeScreen() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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

  // Function to call Gemini API
  const callGeminiApi = async (userMessage: string) => {
    try {
      // Check if API key is available
      if (!GEMINI_API_KEY) {
        return "API key not configured. Please add your Gemini API key to the app configuration."
      }

      const API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

      const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userMessage,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", errorText)
        throw new Error(`API request failed with status ${response.status}`)
      }

      const responseData = await response.json()
      return (
        responseData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response."
      )
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return "Sorry, there was an error processing your request. Please try again later."
    }
  }

  const sendMessage = async () => {
    if (message.trim() === "") return
    setIsLoading(true)

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: chatHistory.length + 1,
      text: message,
      isBot: false,
    }

    setChatHistory((prev) => [...prev, newUserMessage])

    // Store message and clear input
    const userMessageText = message
    setMessage("")

    try {
      // Call Gemini API
      const botResponseText = await callGeminiApi(userMessageText)

      // Add bot response to chat
      const botResponse: ChatMessage = {
        id: chatHistory.length + 2,
        text: botResponseText,
        isBot: true,
      }

      setChatHistory((prev) => [...prev, botResponse])
    } catch (error) {
      Alert.alert("Error", "Failed to get response from AI. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
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
        <ThemedText type="title">Gemini Chat Assistant</ThemedText>
      </ThemedView>

      <ThemedView style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatHistory}
          contentContainerStyle={styles.chatHistoryContent}
        >
          {chatHistory.map((item) => renderChatBubble(item))}
          {isLoading && (
            <ThemedView style={[styles.chatBubble, styles.botBubble]}>
              <IconSymbol
                size={18}
                name="bubble.left.fill"
                color="#4F8EF7"
                style={styles.botIcon}
              />
              <ThemedText style={styles.botText}>Thinking...</ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isLoading || message.trim() === "") && styles.disabledButton,
            ]}
            onPress={sendMessage}
            disabled={isLoading || message.trim() === ""}
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
    padding: 16,
  },
  header: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  chatContainer: {
    flex: 1,
    marginTop: 8,
  },
  chatHistory: {
    flex: 1,
  },
  chatHistoryContent: {
    paddingVertical: 8,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  botBubble: {
    backgroundColor: "#F0F4FF",
    alignSelf: "flex-start",
    marginRight: "auto",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#4F8EF7",
    alignSelf: "flex-end",
    marginLeft: "auto",
    borderBottomRightRadius: 4,
  },
  botText: {
    color: "#333",
  },
  userText: {
    color: "#FFFFFF",
  },
  botIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: "#333",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4F8EF7",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#B0C4DE",
    opacity: 0.7,
  },
})
