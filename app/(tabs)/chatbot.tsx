import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    requestImagePermissions,
    pickImageFromGallery,
    takePhotoWithCamera,
} from "@/src/utils/imageUtils";
import { analyzeImage } from "@/src/api/gemini";
// @ts-ignore
import { saveHealthEvent } from "@/src/api/saveHealthEvent";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

const BASE_PROMPT = `
Sen Copi – Ebeveyn Sağlık Co-Pilotu'sun.
Kullanıcı metin ya da fotoğraf gönderir.
Çıktıyı her zaman şu JSON formatında ver:

{
  "category": "Hastalıklar | Boy-Kilo Analizleri | Doktor Notları | İlaçlar | Tahlil Sonuçları",
  "title": "Kısa başlık",
  "advice": "Tavsiye"
}
`;

export default function Chatbot() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<any[]>([
        { role: "bot", type: "text", text: "Merhaba 👋 Ben senin sağlık asistanın ShevmAI." },
    ]);
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConv, setActiveConv] = useState<number | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        requestImagePermissions().catch((err) => console.warn(err.message));
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    function extractJsonString(text: string): string | null {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : null;
    }

    async function processAIResult(aiResult: string) {
        try {
            const jsonStr = extractJsonString(aiResult);
            if (!jsonStr) {
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
                return;
            }

            const parsed = JSON.parse(jsonStr);
            await saveHealthEvent(parsed);

            if (parsed.advice) {
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: parsed.advice }]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: parsed.title ?? "Bir kayıt alındı." },
                ]);
            }
        } catch (err) {
            setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
        }
    }

    const askGemini = async () => {
        if (!prompt.trim()) return;
        const newMessage = { role: "user", type: "text", text: prompt };
        setMessages((prev) => [...prev, newMessage]);

        // aktif konuşma yoksa yeni oluştur
        if (!activeConv) {
            const newConv = {
                id: Date.now(),
                title: prompt,
                messages: [newMessage],
            };
            setConversations((prev) => [...prev, newConv]);
            setActiveConv(newConv.id);
        } else {
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === activeConv
                        ? { ...conv, messages: [...conv.messages, newMessage] }
                        : conv
                )
            );
        }

        setPrompt("");
        setLoading(true);

        try {
            const result = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: BASE_PROMPT + "\n\nKullanıcı: " + newMessage.text }],
                            },
                        ],
                    }),
                }
            );

            const data = await result.json();
            const aiResult = data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Cevap alınamadı.";
            await processAIResult(aiResult);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "bot", type: "text", text: "⚠️ Hata: API çağrısı başarısız." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleGallery = async () => {
        const img = await pickImageFromGallery();
        if (img) {
            const newMessage = { role: "user", type: "image", uri: img.uri };
            setMessages((prev) => [...prev, newMessage]);

            if (activeConv) {
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === activeConv
                            ? { ...conv, messages: [...conv.messages, newMessage] }
                            : conv
                    )
                );
            }

            const aiResult = await analyzeImage(img.base64!, BASE_PROMPT);
            await processAIResult(aiResult);
        }
    };

    const handleCamera = async () => {
        const img = await takePhotoWithCamera();
        if (img) {
            const newMessage = { role: "user", type: "image", uri: img.uri };
            setMessages((prev) => [...prev, newMessage]);

            if (activeConv) {
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === activeConv
                            ? { ...conv, messages: [...conv.messages, newMessage] }
                            : conv
                    )
                );
            }

            const aiResult = await analyzeImage(img.base64!, BASE_PROMPT);
            await processAIResult(aiResult);
        }
    };

    const startNewConversation = () => {
        const newConv = {
            id: Date.now(),
            title: `Konuşma ${conversations.length + 1}`,
            messages: [
                { role: "bot", type: "text", text: "Yeni konuşma başlatıldı 👋" },
            ],
        };
        setConversations((prev) => [...prev, newConv]);
        setActiveConv(newConv.id);
        setMessages(newConv.messages);
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
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 160}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowSidebar(true)}>
                    <Ionicons name="menu" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ShevmAI</Text>
                <TouchableOpacity onPress={startNewConversation}>
                    <Ionicons name="add-circle" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Mesajlar */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.chatContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input + Kamera/Galeri */}
            <View style={styles.inputContainer}>
                <TouchableOpacity onPress={handleGallery}>
                    <Ionicons name="image-outline" size={26} color="#60a5fa" style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCamera}>
                    <Ionicons name="camera-outline" size={26} color="#60a5fa" style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Bir şeyler yaz..."
                    placeholderTextColor="#94a3b8"
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={askGemini} disabled={loading}>
                    <Text style={styles.sendButtonText}>{loading ? "..." : "➤"}</Text>
                </TouchableOpacity>
            </View>

            {/* Sidebar */}
            <Modal visible={showSidebar} animationType="slide" transparent>
                <View style={styles.sidebarOverlay}>
                    <View style={styles.sidebarContainer}>
                        <View style={styles.sidebar}>
                            <Text style={styles.sidebarTitle}>Eski Konuşmalar</Text>

                            <FlatList
                                data={conversations}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.sidebarItem}
                                        onPress={() => {
                                            setActiveConv(item.id);
                                            setMessages(item.messages); // eski konuşmayı aç
                                            setShowSidebar(false);
                                        }}
                                    >
                                        <Ionicons name="chatbubbles-outline" size={18} color="#e2e8f0" />
                                        <Text numberOfLines={1} style={styles.sidebarText}>
                                            {item.title}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />

                            <TouchableOpacity
                                style={styles.sidebarClose}
                                onPress={() => setShowSidebar(false)}
                            >
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f172a" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: "#1e293b",
    },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    chatContainer: { padding: 10, flexGrow: 1, justifyContent: "flex-end" },
    message: {
        padding: 12,
        borderRadius: 12,
        marginVertical: 6,
        maxWidth: "80%",
    },
    userMessage: {
        backgroundColor: "#2563eb",
        alignSelf: "flex-end",
    },
    botMessage: {
        backgroundColor: "#334155",
        alignSelf: "flex-start",
    },
    messageText: { fontSize: 16, color: "#fff" },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#1e293b",
        backgroundColor: "#0f172a",
        alignItems: "center",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#475569",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 16,
        color: "#fff",
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: "#2563eb",
        borderRadius: 20,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    image: { width: 150, height: 150, borderRadius: 8 },
    sidebarOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    sidebarContainer: {
        marginTop: 60, // Header hizası
        height: "80%", // altı boş kalır
    },
    sidebar: {
        width: 260,
        height: "100%",
        backgroundColor: "#1e293b",
        padding: 16,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    sidebarTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#fff" },
    sidebarItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#334155",
    },
    sidebarText: {
        color: "#e2e8f0",
        fontSize: 14,
        marginLeft: 8,
    },
    sidebarClose: { position: "absolute", top: 10, right: 10 },
});
