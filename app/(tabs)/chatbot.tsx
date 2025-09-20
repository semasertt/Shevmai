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
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    requestImagePermissions,
    pickImageFromGallery,
    takePhotoWithCamera,
} from "@/src/utils/imageUtils";

// @ts-ignore
import {askGeminiAPI, analyzeImage, checkIfRecordWorthy, checkIfImageRecordWorthy} from "@/src/api/gemini";
// @ts-ignore
import { processAIResult } from "@/src/api/parser";
// @ts-ignore
import ChatMessage from "@/components/ui/ChatMessage";
// @ts-ignore
import Sidebar from "@/components/ui/Sidebar";
import {supabase} from "@/lib/supabase";
import {addFollowUpToEvent} from "@/src/api/saveHealthEvent";
import {getCurrentChildWithDetails} from "@/services/children";
import {makeBasePrompt, makeFollowupPrompt} from "@/src/prompts";
import {commonStyles} from "app/styles/common";



export default function Chatbot() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<any[]>([
        { role: "bot", type: "text", text: "Merhaba 👋 Ben senin sağlık asistanın ShevmAI." },
    ]);
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConv, setActiveConv] = useState<number | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [pendingQuestion, setPendingQuestion] = useState(false);
    const [activeEventId, setActiveEventId] = useState<string | null>(null);
// hangi event için detay soruluyor
    const [pendingDetail, setPendingDetail] = useState<string | null>(null);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        requestImagePermissions().catch((err) => console.warn(err.message));
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
        console.log("🟢 Chatbot komponenti yüklendi");
        console.log("🔑 Gemini API Key var mı:", !!process.env.EXPO_PUBLIC_GEMINI_API_KEY);
        console.log("👤 Kullanıcı girişi kontrol ediliyor...");

        // Kullanıcı durumunu kontrol et
        supabase.auth.getUser().then(({ data, error }) => {
            if (error) {
                console.error("❌ Kullanıcı hatası:", error);
            } else {
                console.log("✅ Kullanıcı:", data.user ? "Giriş yapılmış" : "Giriş yapılmamış");
            }
        });
    }, [messages]);

    // 🔹 Metin gönderme
    // YENİ askGemini fonksiyonu
    const askGemini = async () => {
        if (!prompt.trim()) return;
        const child = await getCurrentChildWithDetails();
        const childContext = child ? `
- İsim: ${child.name}
- Doğum tarihi: ${child.birthdate || "bilinmiyor"}
- Cinsiyet: ${child.gender || "bilinmiyor"}
- Boy: ${child.height || "bilinmiyor"}
- Kilo: ${child.weight || "bilinmiyor"}
` : "Çocuk bilgisi seçilmedi.";

        const userMessage = prompt.trim();
        const newMessage = { role: "user", type: "text", text: userMessage };
        setMessages((prev) => [...prev, newMessage]);
        setPrompt("");
        setLoading(true);
// 0. Konuşma geçmişini hazırla
        const conversationHistory = messages
            .map((m) => `${m.role === "user" ? "Ebeveyn" : "Copi"}: ${m.text}`)
            .join("\n");

        try {
            console.log("📝 Kullanıcı mesajı:", userMessage);

            // 1. Eğer önceki bir soruya cevap veriyorsa, FOLLOWUP_PROMPT kullan
            if (pendingQuestion && pendingDetail) {
                console.log("🔄 Önceki soruya cevap (FOLLOWUP_PROMPT)");
// Belirsiz → FOLLOWUP
                const followup = await askGeminiAPI(
                    `${conversationHistory}\nEbeveyn: ${newMessage.text}`,
                    makeFollowupPrompt(childContext)
                );


                setMessages((prev) => [...prev, { role: "bot", type: "text", text: followup }]);

                return;
            }

            // 2. Kayıt değer mi kontrol et
            const shouldSave = await checkIfRecordWorthy(userMessage);
            console.log("📋 Kayıt değer mi:", shouldSave);

            if (!shouldSave) {
                // ❌ Sadece sohbet
                const aiResult = await askGeminiAPI(
                    `${conversationHistory}\nEbeveyn: ${newMessage.text}`,
                    "Sadece sohbet et, kısa cevap ver."
                );
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
                return;
            }

            // 3. YENİ KAYIT - BASE_PROMPT kullan
            const aiResult = await askGeminiAPI(
                `${conversationHistory}\nEbeveyn: ${newMessage.text}`,
                makeBasePrompt(childContext)
            );

            const aiAnswer = await askGeminiAPI(
                `${conversationHistory}\nEbeveyn: ${newMessage.text}`,
                makeFollowupPrompt(childContext)
            );
            // 4. JSON'u işle ve DB'ye kaydet
            const result = await processAIResult(aiResult, undefined, activeEventId);

            if (result.eventId && !activeEventId) {
                setActiveEventId(result.eventId);
            }

            setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiAnswer }]);

            // 6. Eksik bilgi varsa, soru sor ve FOLLOWUP moduna geç
            if (result.questions && result.questions.length > 0) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: result.questions[0] },
                ]);
                setPendingDetail(result.eventId || activeEventId);
                setPendingQuestion(true); // Sonraki mesajlar için FOLLOWUP modu
            }

        } catch (err) {
            console.error("❌ askGemini error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "bot", type: "text", text: "⚠️ Hata oluştu." },
            ]);
        } finally {
            setLoading(false);
        }
    };


    // 🔹 Fotoğraf (galeri) - GÜNCEL
    const handleGallery = async () => {
        const child = await getCurrentChildWithDetails();
        const childContext = child ? `
- İsim: ${child.name}
- Doğum tarihi: ${child.birthdate || "bilinmiyor"}
- Cinsiyet: ${child.gender || "bilinmiyor"}
- Boy: ${child.height || "bilinmiyor"}
- Kilo: ${child.weight || "bilinmiyor"}
` : "Çocuk bilgisi seçilmedi.";
        const conversationHistory = messages
            .map((m) => `${m.role === "user" ? "Ebeveyn" : "Copi"}: ${m.text}`)
            .join("\n");

        try {
            const img = await pickImageFromGallery();
            if (!img) return;

            const newMessage = { role: "user", type: "image", uri: img.uri };
            setMessages((prev) => [...prev, newMessage]);
            setLoading(true);

            // 1. Önce kayıt değer mi kontrol et
            const shouldSave = await checkIfImageRecordWorthy(img.base64!);
            console.log("📋 Görsel kayıt değer mi:", shouldSave);

            if (!shouldSave) {
                // ❌ Sadece sohbet
                const aiAnswer = await analyzeImage(
                    img.base64!,
                    `${conversationHistory}\nEbeveyn: Görsel yüklendi.`,
                    "Bu görseli kısa bir şekilde yorumla, sadece sohbet et."
                );
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiAnswer }]);
                return;
            }

            // 2. ✅ Kayıt değerse, BASE_PROMPT ile analiz et
            const aiResult = await analyzeImage(
                img.base64!,
                `${conversationHistory}\n${childContext}\nEbeveyn: Görsel yüklendi.`,
                makeBasePrompt(childContext)
            );

            const aiAnswer = await analyzeImage(
                img.base64!,
                `${conversationHistory}\n${childContext}\nEbeveyn: Görsel yüklendi.`,
                makeFollowupPrompt(childContext)
            );


            // 4. JSON'u işle ve DB'ye kaydet (aktif kayıt varsa append edecek!)
            const result = await processAIResult(
                aiResult,
                img.uri,
                activeEventId || pendingDetail
            );
            console.log("💾 Görsel işlendi ID:", result.eventId);

            if (result.eventId && !activeEventId) {
                setActiveEventId(result.eventId);
            }

            setMessages((prev) => [
                ...prev,
                { role: "bot", type: "text", text: aiAnswer },
            ]);

            // 5. Eksik bilgi sorusu varsa
            if (result.questions && result.questions.length > 0) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: result.questions[0] },
                ]);
                setPendingDetail(result.eventId || activeEventId);
                setPendingQuestion(true);
            }

        } catch (err) {
            console.error("❌ handleGallery error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "bot", type: "text", text: "⚠️ Görsel işlenirken hata oluştu." },
            ]);
        } finally {
            setLoading(false);
        }
    };
// 🔹 Fotoğraf (kamera) - GÜNCEL
    const handleCamera = async () => {
        const child = await getCurrentChildWithDetails();
        const childContext = child ? `
- İsim: ${child.name}
- Doğum tarihi: ${child.birthdate || "bilinmiyor"}
- Cinsiyet: ${child.gender || "bilinmiyor"}
- Boy: ${child.height || "bilinmiyor"}
- Kilo: ${child.weight || "bilinmiyor"}
` : "Çocuk bilgisi seçilmedi.";
        const conversationHistory = messages
            .map((m) => `${m.role === "user" ? "Ebeveyn" : "Copi"}: ${m.text}`)
            .join("\n");

        try {
            const img = await takePhotoWithCamera();
            if (!img) return;

            const newMessage = { role: "user", type: "image", uri: img.uri };
            setMessages((prev) => [...prev, newMessage]);
            setLoading(true);

            // 1. Önce kayıt değer mi kontrol et
            const shouldSave = await checkIfImageRecordWorthy(img.base64!);
            console.log("📋 Görsel kayıt değer mi:", shouldSave);

            if (!shouldSave) {
                // ❌ Sadece sohbet
                const aiAnswer = await analyzeImage(
                    img.base64!,
                    `${conversationHistory}\nEbeveyn: Görsel yüklendi.`,
                    "Bu görseli kısa bir şekilde yorumla, sadece sohbet et."
                );
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiAnswer }]);
                return;
            }

            // 2. ✅ Kayıt değerse, BASE_PROMPT ile analiz et
            const aiResult = await analyzeImage(
                img.base64!,
                `${conversationHistory}\n${childContext}\nEbeveyn: Görsel yüklendi.`,
                makeBasePrompt(childContext)
            );

            const aiAnswer = await analyzeImage(
                img.base64!,
                `${conversationHistory}\n${childContext}\nEbeveyn: Görsel yüklendi.`,
                makeFollowupPrompt(childContext)
            );


            // 4. JSON'u işle ve DB'ye kaydet (aktif kayıt varsa append edecek!)
            const result = await processAIResult(
                aiResult,
                img.uri,
                activeEventId || pendingDetail
            );
            console.log("💾 Görsel işlendi ID:", result.eventId);

            if (result.eventId && !activeEventId) {
                setActiveEventId(result.eventId);
            }

            setMessages((prev) => [
                ...prev,
                { role: "bot", type: "text", text: aiAnswer },
            ]);

            // 5. Eksik bilgi sorusu varsa
            if (result.questions && result.questions.length > 0) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: result.questions[0] },
                ]);
                setPendingDetail(result.eventId || activeEventId);
                setPendingQuestion(true);
            }

        } catch (err) {
            console.error("❌ handleCamera error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "bot", type: "text", text: "⚠️ Görsel işlenirken hata oluştu." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const startNewConversation = () => {
        // 1. Konuşma geçmişini kaydet (eski sistem)
        const newConv = {
            id: Date.now(),
            title: `Konuşma ${conversations.length + 1}`,
            messages: [{ role: "bot", type: "text", text: "Yeni konuşma başlatıldı 👋" }],
        };
        setConversations((prev) => [...prev, newConv]);
        setActiveConv(newConv.id);
        setMessages(newConv.messages);

        // 2. Event state'lerini temizle (yeni sistem)
        setActiveEventId(null);
        setPendingDetail(null);
    };
    return (
        <KeyboardAvoidingView
            style={commonStyles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 180}
        >
            {/* Header */}
            <View style={commonStyles.header}>
                <TouchableOpacity onPress={() => setShowSidebar(true)}>
                    <Ionicons name="menu" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>ShevmAI</Text>
                <TouchableOpacity onPress={startNewConversation}>
                    <Ionicons name="add-circle" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Mesajlar */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item }) => <ChatMessage item={item} />}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={commonStyles.chatContainer}
            />

            {/* Input */}
            <View style={commonStyles.inputContainer}>
                <TouchableOpacity onPress={handleGallery}>
                    <Ionicons name="image-outline" size={26} color="#60a5fa" style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCamera}>
                    <Ionicons name="camera-outline" size={26} color="#60a5fa" style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <TextInput
                    style={commonStyles.input}
                    placeholder="Bir şeyler yaz..."
                    placeholderTextColor="#94a3b8"
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                />
                <TouchableOpacity style={commonStyles.sendButton} onPress={askGemini} disabled={loading}>
                    <Text style={commonStyles.sendButtonText}>{loading ? "..." : "➤"}</Text>
                </TouchableOpacity>
            </View>

            {/* Sidebar */}
            <Modal visible={showSidebar} animationType="slide" transparent>
                <View style={commonStyles.sidebarOverlay}>
                    <View style={commonStyles.sidebarContainer}>
                        <Sidebar
                            conversations={conversations}
                            onSelect={(conv: any) => {
                                setActiveConv(conv.id);
                                setMessages(conv.messages);
                                setShowSidebar(false);
                            }}
                            onClose={() => setShowSidebar(false)}
                        />
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

