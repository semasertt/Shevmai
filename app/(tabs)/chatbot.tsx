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
import {askGeminiAPI, analyzeImage, checkIfRecordWorthy, checkIfAmbiguous} from "@/src/api/gemini";
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
Sen Copi – Ebeveyn Sağlık Co-Pilotu'sun.
Kullanıcı bir sağlık olayı kaydetti. Senin görevin:
Aşağıda ebeveyn ile önceki konuşma geçmişi var. 
Konuşmanın bağlamını dikkate alarak yanıt ver.
Ana konudan sapma.
Ve sevecen davran.

Kurallar:
1. Doktor gibi davran.
2. Önce olayı kısa özetle.
3. Ardından olası nedeni veya ön tanıyı yaz ("şundan kaynaklanıyor olabilir", "buna bağlı olabilir" gibi).
4. Risk seviyesini belirt (düşük/orta/yüksek).
5. En fazla 1 tane eksik bilgiyi tamamlayıcı kısa soru sor.
6. Kullanıcı "yok", "hayır", "evet", "başka belirtim yok" gibi cevap verirse, bunu son soruna yanıt olarak değerlendir.
7. JSON dönme, sadece düz metin dön.

Kategoriye göre soru kuralları:
- "İlaç" → İlacın adı, dozu veya nedenini sor.
- "Hastalık/belirti" → Süre, şiddet veya ek semptomları sor.
- "Tahlil sonucu" → Hangi test yapıldığı veya değerin kaç olduğu sor.
- "Boy/Kilo" → Çocuğun yaşı veya son ölçüm tarihi sor.
- "Uyku" → Kaç saattir devam ettiği veya uyku düzeni sor.
- "Beslenme" → Günlük öğün sayısı veya çeşitlilik sor.
- "Aşı" → Hangi aşı yapıldığı veya tarihi sor.
- "Acil durum" → Şikayetin süresi veya şiddeti sor.

Yanıt formatı:
1. Tahmin: olası neden / ön tanı
2. Risk: doğal ifadeyle durumun ciddiyeti
3. Soru: sadece 1 adet ek bilgi sorusu

Örnek:
Ebeveyn: "Çocuğum öksürüyor."
Copi: 
Özet: Çocuğunuzda öksürük şikayeti var.
Tahmin: Bu durum enfeksiyon veya alerji kaynaklı olabilir.
Risk: orta
Soru: Ne zamandır öksürüyor?

Ebeveyn: "Parasetamol 5 ml verdim."
Copi:
Özet: Parasetamol verilmiş.
Tahmin: Genellikle ateş veya ağrı için kullanılır, doz çocuğun kilosuna göre uygunluğu kontrol edilmeli.
Risk: orta
Soru: Çocuğun kilosu kaç kg ve parasetamolü neden verdiniz?
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

        try {
            console.log("📝 Kullanıcı mesajı:", userMessage);

            // 1. Eğer önceki bir soruya cevap veriyorsa, FOLLOWUP_PROMPT kullan
            if (pendingQuestion && pendingDetail) {
                console.log("🔄 Önceki soruya cevap (FOLLOWUP_PROMPT)");
                const aiResult = await askGeminiAPI(userMessage, FOLLOWUP_PROMPT);
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
                return;
            }

            // 2. Kayıt değer mi kontrol et
            const shouldSave = await checkIfRecordWorthy(userMessage);
            console.log("📋 Kayıt değer mi:", shouldSave);

            if (!shouldSave) {
                console.log("❌ Kayıt değil, normal sohbet (FOLLOWUP_PROMPT)");
                const aiResult = await askGeminiAPI(userMessage, FOLLOWUP_PROMPT);
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
                return;
            }

            // 3. YENİ KAYIT - BASE_PROMPT kullan
            console.log("✅ Yeni kayıt oluşturuluyor (BASE_PROMPT)");
            const aiResult = await askGeminiAPI(userMessage, BASE_PROMPT);

            // 4. JSON'u işle ve DB'ye kaydet
            const result = await processAIResult(aiResult, undefined, activeEventId);

            if (result.eventId && !activeEventId) {
                setActiveEventId(result.eventId);
            }

            // 5. Kullanıcıya formatlanmış yanıtı göster
            if (result.displayText) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: result.displayText },
                ]);
            }

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
        try {
            const img = await pickImageFromGallery();
            if (!img) return;

            const newMessage = { role: "user", type: "image", uri: img.uri };
            setMessages((prev) => [...prev, newMessage]);
            setLoading(true);

            // Görseli analiz et - BASE_PROMPT kullan
            const aiResult = await analyzeImage(img.base64!, BASE_PROMPT);
            console.log("📸 Görsel analiz sonucu:", aiResult);

            // Kayıt değer mi kontrol et
            const shouldSave = await checkIfRecordWorthy(aiResult);
            console.log("📋 Görsel kayıt değer mi:", shouldSave);

            if (!shouldSave) {
                // Kayıt değilse, direkt göster
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
                return;
            }

            // Kayıt değerse, işle ve DB'ye kaydet
            const result = await processAIResult(aiResult, img.uri);
            console.log("💾 Görsel kayıt sonucu:", result);

            if (result.displayText) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: result.displayText },
                ]);
            }

            // Eksik bilgi sorusu varsa
            if (result.questions && result.questions.length > 0) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: result.questions[0] },
                ]);
                setPendingDetail(result.eventId || activeEventId);
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
        try {
            const img = await takePhotoWithCamera();
            if (!img) return;

            const newMessage = { role: "user", type: "image", uri: img.uri };
            setMessages((prev) => [...prev, newMessage]);
            setLoading(true);

            // Görseli analiz et - BASE_PROMPT kullan
            const aiResult = await analyzeImage(img.base64!, BASE_PROMPT);
            console.log("📸 Kamera analiz sonucu:", aiResult);

            // Kayıt değer mi kontrol et
            const shouldSave = await checkIfRecordWorthy(aiResult);
            console.log("📋 Kamera kayıt değer mi:", shouldSave);

            if (!shouldSave) {
                // Kayıt değilse, direkt göster
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
                return;
            }

            // Kayıt değerse, işle ve DB'ye kaydet
            const result = await processAIResult(aiResult, img.uri);
            console.log("💾 Kamera kayıt sonucu:", result);

            if (result.displayText) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: result.displayText },
                ]);
            }

            // Eksik bilgi sorusu varsa
            if (result.questions && result.questions.length > 0) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: result.questions[0] },
                ]);
                setPendingDetail(result.eventId || activeEventId);
            }

        } catch (err) {
            console.error("❌ handleCamera error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "bot", type: "text", text: "⚠️ Kamera hatası oluştu." },
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
