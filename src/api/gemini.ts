// src/api/gemini.ts

// src/api/gemini.ts
export async function analyzeImage(
    base64: string,
    prompt: string // <-- burada ekledik
) {
    const API_KEY = "AIzaSyAhEfCRjhxxlFg9TWCsPHzPf1uCao3iXho";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }, // artık parametreden geliyor
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
        console.log("🔍 analyzeImage response:", JSON.stringify(data, null, 2));

        return (
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "❌ Görselden yanıt alınamadı."
        );
    } catch (err) {
        console.error("❌ analyzeImage error:", err);
        return "⚠️ Hata: Görsel analizi başarısız.";
    }
}
