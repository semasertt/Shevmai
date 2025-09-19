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

const BASE_PROMPT = `
Sen Copi – Ebeveyn Sağlık Co-Pilotu'sun.
Kullanıcı bir sağlık olayı (ilaç, ateş, boy-kilo, tahlil, beslenme vb.) girer.
Senin görevin:

1. Olayı kategorileştir.
2. Eksik bilgi varsa belirt (örn. "neden ilaç verildi?", "çocuğun kilosu kaç kg?").
3. İlaç ise dozu yaş/kilo ile kıyasla, doğru mu değil mi kontrol et.
Yanıtın mutlaka geçerli JSON formatında olsun. JSON dışında hiçbir şey yazma.
JSON dışında hiçbir metin yazma.

{
  "category": "...",
  "title": "Kısa başlık",
  "summary": "Olayın özeti",
  "analysis": "Eksik bilgiler ve mevcut bilgilere göre yorum",
  "risk": "low | medium | high",
  "advice": "Ebeveyne pratik tavsiye",
  "nextStep": "Bir sonraki yapılması gereken",
  "questions": ["Eksik bilgi tamamlamak için 1-2 soru"]
}
`;

const FOLLOWUP_PROMPT = `
Sen Copi – ebeveynlere destek olan sevecen bir çocuk sağlığı asistanısın.
Kullanıcı bir sağlık olayı kaydetti. Onunla sohbet ederken doktor gibi ama samimi ve anlaşılır konuş.

Kurallar:
1. Önce olayı ebeveynin anlayacağı şekilde kısaca özetle.
2. Sonra olası nedeni veya açıklamayı yaz ("şundan kaynaklanıyor olabilir", "buna bağlı olabilir" gibi).
3. Risk seviyesini belirt ama korkutma; "endişe etmeyin, şimdilik ..." gibi doğal cümleler kullan.
4. En fazla 1 tane tamamlayıcı soru sor ama kısa, günlük konuşma dilinde olsun.
5. Gereksiz resmi ifadelerden kaçın. "Tahmin", "Özet", "Risk" gibi başlıklar yazma, doğal bir akış olsun.
6. JSON dönme, sadece düz metin dön.
7. Samimi ve sakin ol, bir doktorun ebeveyni bilgilendirmesi gibi konuş.

Örnekler:
Ebeveyn: "Çocuğum öksürüyor."
Copi: "Anladım, öksürüğü var. Bu çoğunlukla enfeksiyon ya da alerjiden olabilir. Çok ciddi görünmese de dikkat etmek iyi olur. Kaç gündür devam ediyor?"
cevapta emojide kullan.
Ebeveyn: "Parasetamol 5 ml verdim."
Copi: "Parasetamol vermişsiniz, genelde ateş ya da ağrı için kullanılır. Dozun çocuğun kilosuna uygun olup olmadığını bilmek önemli. Kaç kilo şu anda ve neden verdiniz?"
`;


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
                    FOLLOWUP_PROMPT
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
                BASE_PROMPT
            );
            const aiAnswer = await askGeminiAPI(
                `${conversationHistory}\nEbeveyn: ${newMessage.text}`,
                FOLLOWUP_PROMPT
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


    // 🔹 Fotoğraf (galeri) - DÜZELTİLMİŞ
    const handleGallery = async () => {
        const conversationHistory = messages
            .map((m) => `${m.role === "user" ? "Ebeveyn" : "Copi"}: ${m.text}`)
            .join("\n");
        try {
            const img = await pickImageFromGallery();
            if (!img) return;

            const newMessage = { role: "user", type: "image", uri: img.uri };
            setMessages((prev) => [...prev, newMessage]);
            setLoading(true);

            // 1. Önce kayıt değer mi kontrol et (görselin kendisini analiz ederek)
            const shouldSave = await checkIfImageRecordWorthy(img.base64!);
            console.log("📋 Görsel kayıt değer mi:", shouldSave);

            if (!shouldSave) {
                // ❌ Sadece sohbet - görseli basitçe yorumla
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
                `${conversationHistory}\nEbeveyn: Görsel yüklendi.`,
                BASE_PROMPT
            );
            console.log("📸 Görsel analiz sonucu:", aiResult);

            // 3. Kullanıcıya yanıt ver (FOLLOWUP_PROMPT ile)
            const aiAnswer = await analyzeImage(
                img.base64!,
                `${conversationHistory}\nEbeveyn: Görsel yüklendi.`,
                FOLLOWUP_PROMPT
            );

            // 4. JSON'u işle ve DB'ye kaydet
            const result = await processAIResult(aiResult, img.uri);
            console.log("kaydedildi");

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


// 🔹 Fotoğraf (kamera) - DÜZELTİLMİŞ
    const handleCamera = async () => {
        const conversationHistory = messages
            .map((m) => `${m.role === "user" ? "Ebeveyn" : "Copi"}: ${m.text}`)
            .join("\n");
        try {
            const img = await takePhotoWithCamera();
            if (!img) return;

            const newMessage = { role: "user", type: "image", uri: img.uri };
            setMessages((prev) => [...prev, newMessage]);
            setLoading(true);

            // 1. Önce kayıt değer mi kontrol et (görselin kendisini analiz ederek)
            const shouldSave = await checkIfImageRecordWorthy(img.base64!);
            console.log("📋 Görsel kayıt değer mi:", shouldSave);

            if (!shouldSave) {
                // ❌ Sadece sohbet - görseli basitçe yorumla
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
                `${conversationHistory}\nEbeveyn: Görsel yüklendi.`,
                BASE_PROMPT
            );
            console.log("📸 Görsel analiz sonucu:", aiResult);

            // 3. Kullanıcıya yanıt ver (FOLLOWUP_PROMPT ile)
            const aiAnswer = await analyzeImage(
                img.base64!,
                `${conversationHistory}\nEbeveyn: Görsel yüklendi.`,
                FOLLOWUP_PROMPT
            );

            // 4. JSON'u işle ve DB'ye kaydet
            const result = await processAIResult(aiResult, img.uri);
            console.log("kaydedildi");

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
            console.error("❌ handlecamera error:", err);
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
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 180}
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
                renderItem={({ item }) => <ChatMessage item={item} />}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.chatContainer}
            />

            {/* Input */}
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
    sidebarOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    sidebarContainer: { marginTop: 60, height: "80%" },
});
