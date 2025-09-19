// src/api/parser.ts
import {saveHealthEvent} from "@/src/api/saveHealthEvent";

// src/api/parser.ts
export async function processAIResult(aiResult: string, imageUri?: string, eventId?: string | null) {
    try {
        console.log("🔍 AI Raw Result:", aiResult);

        // 1. JSON'u ayıkla
        const clean = aiResult.replace(/```json|```/g, "").trim();
        const match = clean.match(/\{[\s\S]*\}/);

        if (!match) {
            // JSON değilse, AI yanıtını olduğu gibi göster
            return {
                displayText: aiResult,
                eventId: null,
                questions: []
            };
        }

        const parsed = JSON.parse(match[0]);
        console.log("✅ Parsed JSON:", parsed);

        // 2. DB işlemleri - GÖRSELLİ kayıt
        const savedId = await saveHealthEvent({
            category: parsed.category || "Diğer",
            title: parsed.title || "Görsel Sağlık Kaydı",
            details: parsed.summary || "Görselden analiz edilen sağlık olayı",
            advice: parsed.advice,
            image_url: imageUri, // ⬅️ BURASI ÖNEMLİ: Görsel URI'sini kaydet
            date: new Date().toISOString(),
        });

        console.log("💾 Görsel kaydedildi ID:", savedId);

        // 3. Kullanıcı için formatlanmış metin oluştur
        const displayText = `
📸 ${parsed.title || "Görsel Analiz"}

${parsed.summary || "Görselden analiz edildi"}

🔍 ${parsed.analysis || ""}

⚠️ Risk: ${parsed.risk || "belirsiz"}
💡 Tavsiye: ${parsed.advice || ""}
        `.trim();

        return {
            displayText,
            eventId: savedId,
            questions: parsed.questions || [],
        };
    } catch (err) {
        console.error("❌ processAIResult hatası:", err);
        return {
            displayText: "⚠️ Görsel işlenirken hata oluştu",
            eventId: null,
            questions: []
        };
    }
}