import React, { useState, useRef, useEffect } from "react";

const GEMINI_KEY = "AIzaSyAhEfCRjhxxlFg9TWCsPHzPf1uCao3iXho";

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

// 🔹 Ortak prompt
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

// 🔹 Home.tsx ile uyumlu kategori eşleme
const CATEGORY_MAP: { [key: string]: string } = {
    "ölçüm": "Boy-Kilo Analizleri",
    "aşı": "Aşılar", // Home’da yoksa ekleyebilirsin
    "ilaç": "İlaçlar",
    "belirti": "Hastalıklar",
    "tetkik": "Tahlil Sonuçları",
    "doktorNotu": "Doktor Notları",
};

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
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : null;
    }

    async function processAIResult(aiResult: string) {
        console.log("🔍 AI result ham:", aiResult);

        try {
            const jsonStr = extractJsonString(aiResult);

            if (!jsonStr) {
                console.warn("⚠️ AI cevabında JSON bulunamadı:", aiResult);
                setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
                return;
            }

            const parsed = JSON.parse(jsonStr);
            console.log("✅ JSON parse başarılı:", parsed);

            // ✅ Kategoriyi Home ile uyumlu hale getir
            const mappedCategory = CATEGORY_MAP[parsed.category] || "Diğer";

            const finalEvent = {
                ...parsed,
                category: mappedCategory,
            };

            // 🔹 Supabase’e kaydet
            await saveHealthEvent(finalEvent);

            // 🔹 Local state güncelle
            setEventsByCategory((prev) => {
                const cat = finalEvent.category;
                const current = prev[cat] || [];
                return {
                    ...prev,
                    [cat]: [...current, finalEvent],
                };
            });

            setRecords((prev) => [...prev, finalEvent]);

            // ✅ Kullanıcıya sadece advice göster
            if (finalEvent.advice) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: finalEvent.advice },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", type: "text", text: finalEvent.title ?? "Bir kayıt alındı." },
                ]);
            }
        } catch (err) {
            console.error("❌ JSON parse veya kayıt hatası:", err);
            setMessages((prev) => [...prev, { role: "bot", type: "text", text: aiResult }]);
        }
    }

    // Text input → Gemini
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
                    const mappedCategory = CATEGORY_MAP[parsed.category] || "Diğer";
                    await saveHealthEvent({ ...parsed, category: mappedCategory, image_url: img.uri });
                } catch (err) {
                    console.error("❌ JSON parse error:", err);
                }
            }
        }
    };

    // Kamera
    const handleCamera = async () => {
        const img = await takePhotoWithCamera();
        if (img) {
            setMessages((prev) => [...prev, { role: "user", type: "image", uri: img.uri }]);

            const aiResult = await analyzeImage(img.base64!, BASE_PROMPT);
            const jsonStr = extractJsonString(aiResult);

            if (jsonStr) {
                try {
                    const parsed = JSON.parse(jsonStr);
                    const mappedCategory = CATEGORY_MAP[parsed.category] || "Diğer";
                    await saveHealthEvent({ ...parsed, category: mappedCategory, image_url: img.uri });
                } catch (err) {
                    console.error("❌ JSON parse error:", err);
                }
            }
        }
    };

   
