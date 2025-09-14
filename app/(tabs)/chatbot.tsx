import React, { useState, useRef, useEffect } from "react";
import { analyzeImage } from "@/src/api/gemini";

import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, KeyboardAvoidingView, Platform, Image, Button
} from "react-native";

import {
    requestImagePermissions,
    pickImageFromGallery,
    takePhotoWithCamera,
} from "@/src/utils/imageUtils";

// 🔑 Key'i env'den oku
const API_KEY = 'AIzaSyAhEfCRjhxxlFg9TWCsPHzPf1uCao3iXho';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const App = () => {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        requestImagePermissions().catch((err) => console.warn(err.message));
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const askGemini = async () => {
        if (!prompt.trim()) return;
        const newMessage = { role: "user", type: "text", text: prompt };
        setMessages((prev) => [...prev, newMessage]);
        setPrompt("");
        setLoading(true);

        try {
            const result = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: newMessage.text }] }],
                }),
            });

            const data = await result.json();
            const botReply =
                data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "❌ Cevap alınamadı.";

            setMessages((prev) => [...prev, { role: "bot", type: "text", text: botReply }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "bot", type: "text", text: "⚠️ Hata: API çağrısı başarısız." }]);
        } finally {
            setLoading(false);
        }
    };

    // 📂 Galeri
    const handleGallery = async () => {
        const img = await pickImageFromGallery();
        if (img) {
            setMessages((prev) => [...prev, { role: "user", type: "image", uri: img.uri }]);
            const aiResult = await analyzeImage(img.base64!, "Bu fotoğrafı açıklayabilir misin?");
            setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
        }
    };

    // 📷 Kamera
    const handleCamera = async () => {
        const img = await takePhotoWithCamera();
        if (img) {
            setMessages((prev) => [...prev, { role: "user", type: "image", uri: img.uri }]);
            const aiResult = await analyzeImage(img.base64!);
            setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
        }
    };
    const renderItem = ({ item }: { item: any }) => (
        <View
            style={[
                styles.message,
                item.role === "user" ? styles.userMessage : styles.botMessage,
            ]}
        >
            {item.type === "image" ? (
                <Image source={{ uri: item.uri }} style={styles.image} />
            ) : (
                <Text style={styles.messageText}>{item.text}</Text>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            {/* Mesajlar */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.chatContainer}
                onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                }
            />

            {/* Prompt alanı */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Bir şeyler yazın..."
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                    onSubmitEditing={askGemini}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={askGemini}
                    disabled={loading}
                >
                    <Text style={styles.sendButtonText}>{loading ? "..." : "➤"}</Text>
                </TouchableOpacity>
            </View>

            {/* Kamera/Galeri Butonları */}
            <View style={styles.buttonRow}>
                <Button title="🖼️ Galeri" onPress={handleGallery} />
                <Button title="📷 Kamera" onPress={handleCamera} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    chatContainer: { padding: 10, flexGrow: 1, justifyContent: "flex-end" },
    message: {
        padding: 12,
        borderRadius: 12,
        marginVertical: 6,
        maxWidth: "80%",
    },
    userMessage: {
        backgroundColor: "#DCF8C6",
        alignSelf: "flex-end",
    },
    botMessage: {
        backgroundColor: "#F1F0F0",
        alignSelf: "flex-start",
    },
    messageText: { fontSize: 16 },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        alignItems: "center",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: "#007AFF",
        borderRadius: 20,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    image: { width: 150, height: 150, borderRadius: 8 },
});

export default App;
