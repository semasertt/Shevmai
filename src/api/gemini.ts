import {useState} from "react";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;


export async function askGeminiAPI(text: string, prompt: string) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt + "\n\nKullanıcı: " + text }] }],
        }),
    });
    const data = await res.json();
    console.log("🔍 Gemini raw response:", JSON.stringify(data, null, 2)); // 👈 BURASI

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Cevap alınamadı.";
}

export async function analyzeImage(base64: string, context: string, prompt?: string) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: context },                // 🔹 konuşma geçmişi / context
                            ...(prompt ? [{ text: prompt }] : []), // 🔹 varsa ek prompt
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: base64,
                                },
                            },
                        ],
                    },
                ],
            }),
        });

        const data = await res.json();

        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Görselden yanıt alınamadı.";
    } catch (err) {
        console.error("❌ analyzeImage error:", err);
        return "❌ API hatası oluştu.";
    }
}

export async function checkIfImageRecordWorthy(base64Image: string): Promise<boolean> {
    const IS_IMAGE_RECORD_PROMPT = `
Sen Copi – Ebeveyn Sağlık Co-Pilotu'sun.
Kullanıcının görselinin bir sağlık olayını kaydetmeye değer olup olmadığını belirle.

Aşağıdaki durumlarda {"record": true} dön:
- İlaç fotoğrafları (şişe, kutu, şurup vb.)
- Ateş ölçer termometre fotoğrafları
- Boy/kilo ölçüm sonuçları
- Tahlil sonuçları (kan tahlili, idrar tahlili vb.)
- Hastalık belirtileri (döküntü, kızarıklık, şişlik vb.)
- Aşı kartları veya bilgileri
- Acil durumlar (yaralanma, kanama vb.)
- Yara, tahriş, morluk, kan fotoğrafları
- Tıbbi cihazlar veya ekipmanlar

Aşağıdaki durumlarda {"record": false} dön:
- Kişi fotoğrafları (sağlık durumuyla ilgili olmayan)
- Manzara, doğa fotoğrafları
- Oyuncak veya günlük nesneler
- Yiyecek/içecek (tıbbi amaçlı olmayan)
- Genel sohbet için gönderilen görseller

Sadece şu formatta cevap ver:
{"record": true}
{"record": false}
`;

    try {
        const response = await analyzeImage(base64Image, IS_IMAGE_RECORD_PROMPT);

        // JSON formatını parse et
        const match = response.match(/\{.*\}/);
        if (!match) return false;

        const parsed = JSON.parse(match[0]);
        return parsed.record === true;

    } catch (error) {
        console.error("Görsel kayıt kontrol hatası:", error);
        // Hata durumunda varsayılan olarak true dön (güvenli tarafta kal)
        return true;
    }
}
export async function checkIfRecordWorthy(text: string): Promise<boolean> {
    const IS_RECORD_PROMPT = `
Sen Copi – Ebeveyn Sağlık Co-Pilotu'sun.
Kullanıcının mesajının bir sağlık olayını kaydetmeye değer olup olmadığını belirle.

Aşağıdaki durumlarda {"record": true} dön:
- İlaç kullanımı (parol, antibiyotik, ağrı kesici vb.)
- Ateş ölçümü
- Boy/kilo ölçümü
- Tahlil sonuçları
- Hastalık belirtileri (öksürük, ateş, kusma vb.)
- Aşı bilgileri
- Acil durumlar
-yara , tahriş,morluk,kan fotoğrafları

Aşağıdaki durumlarda {"record": false} dön:
- Selamlama (merhaba, nasılsın vb.)
- Teşekkür ifadeleri
- Genel sohbet mesajları
- Sağlıkla ilgili olmayan konular

Sadece şu formatta cevap ver:
{"record": true}
{"record": false}
`;
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: IS_RECORD_PROMPT + "\n\nKullanıcı: " + text }] }],
        }),
    });
    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = responseText.match(/\{.*\}/);
    if (!match) return false;
    const parsed = JSON.parse(match[0]);
    return parsed.record === true;
}
