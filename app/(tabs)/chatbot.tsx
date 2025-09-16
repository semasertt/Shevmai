import React, { useState, useRef, useEffect } from "react";

const GEMINI_KEY = 'AIzaSyAhEfCRjhxxlFg9TWCsPHzPf1uCao3iXho';

import { analyzeImage } from "@/src/api/gemini";
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
    Button,
} from "react-native";
import {
    requestImagePermissions,
    pickImageFromGallery,
    takePhotoWithCamera,
} from "@/src/utils/imageUtils";
// @ts-ignore
import { saveHealthEvent } from "@/src/api/saveHealthEvent";

// Ortak prompt
const BASE_PROMPT = `
Sen Copi – Ebeveyn Sağlık Co-Pilotu'sun.
Kullanıcı metin ya da fotoğraf gönderir.
Çıktıyı her zaman şu JSON formatında ver:

{
  "category": "ölçüm | aşı | ilaç | belirti | tetkik | doktorNotu",
  "title": "Kısa başlık",
  "advice": "Tavsiye"

}
`;

export default function Chatbot() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [eventsByCategory, setEventsByCategory] = useState<{ [key: string]: any[] }>({});


    useEffect(() => {
        requestImagePermissions().catch((err) => console.warn(err.message));
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);
    function extractJsonString(text: string): string | null {
        // Regex ile JSON blok yakala
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : null;
    }

    async function processAIResult(aiResult: string) {
        console.log("🔍 AI result ham:", aiResult);

        try {
            const jsonStr = extractJsonString(aiResult);

            if (!jsonStr) {
                console.warn("⚠️ AI cevabında JSON bulunamadı:", aiResult);
                // JSON yoksa olduğu gibi metni göster
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
                return;
            }

            const parsed = JSON.parse(jsonStr);
            console.log("✅ JSON parse başarılı:", parsed);

            // Kaydet (Supabase’e JSON’u gönderiyoruz)
            await saveHealthEvent(parsed);

            // Local state güncelle
            setEventsByCategory((prev) => {
                const cat = parsed.category || "diğer";
                const current = prev[cat] || [];
                return {
                    ...prev,
                    [cat]: [...current, parsed],
                };
            });

            setRecords((prev) => [...prev, parsed]);

            // ✅ Kullanıcıya sadece advice göster
            if (parsed.advice) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: parsed.advice },
                ]);
            } else {
                // advice yoksa sadece title gösterelim
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: parsed.title ?? "Bir kayıt alındı." },
                ]);
            }

        } catch (err) {
            console.error("❌ JSON parse veya kayıt hatası:", err);
            setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
        }
    }



    // Text
    const askGemini = async () => {
        if (!prompt.trim()) return;
        const newMessage = { role: "user", type: "text", text: prompt };
        setMessages((prev) => [...prev, newMessage]);
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
                                parts: [
                                    { text: BASE_PROMPT + "\n\nKullanıcı: " + newMessage.text },
                                ],
                            },
                        ],
                    }),
                }
            );

            const data = await result.json();
            const aiResult =
                data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Cevap alınamadı.";

            await processAIResult(aiResult);
        } catch (error) {
            console.error("⚠️ API çağrısı hatası:", error);
            setMessages((prev) => [
                ...prev,
                { role: "bot", type: "text", text: "⚠️ Hata: API çağrısı başarısız." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Galeri

    const handleGallery = async () => {
        const img = await pickImageFromGallery();
        if (img) {
            setMessages((prev) => [...prev, { role: "user", type: "image", uri: img.uri }]);

            const aiResult = await analyzeImage(img.base64!, BASE_PROMPT);
            const jsonStr = extractJsonString(aiResult);

            if (jsonStr) {
                try {
                    const parsed = JSON.parse(jsonStr);
                    // 🔹 resmi de kaydet
                    await saveHealthEvent({
                        ...parsed,
                        image_url: img.uri,
                    });
                } catch (err) {
                    console.error("❌ JSON parse error:", err);
                }
            }
        }
    };

    const handleCamera = async () => {
        const img = await takePhotoWithCamera();
        if (img) {
            setMessages((prev) => [...prev, { role: "user", type: "image", uri: img.uri }]);

            const aiResult = await analyzeImage(img.base64!, BASE_PROMPT);
            const jsonStr = extractJsonString(aiResult);

            if (jsonStr) {
                try {
                    const parsed = JSON.parse(jsonStr);
                    await saveHealthEvent({
                        ...parsed,
                        image_url: img.uri,
                    });
                } catch (err) {
                    console.error("❌ JSON parse error:", err);
                }
            }
        }
    };


    // Render
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
            keyboardVerticalOffset={Platform.OS === "ios" ? 130 : 130}
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

            {/* Input */}
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

            {/* Kamera / Galeri */}
            <View style={styles.buttonRow}>
                <Button title="🖼️ Galeri" onPress={handleGallery} />
                <Button title="📷 Kamera" onPress={handleCamera} />
            </View>
        </KeyboardAvoidingView>
    );
}

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
    storyContainer: {
        position: "absolute",
        top: 40,
        left: 10,
        right: 0,
        height: 200,
    },


});


