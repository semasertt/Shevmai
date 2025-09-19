// src/api/parser.ts
import {saveHealthEvent} from "@/src/api/saveHealthEvent";

import { addFollowUpToEvent } from "@/src/api/saveHealthEvent";

export async function processAIResult(
    aiResult: string,
    imageUri?: string,
    eventId?: string | null
) {
    try {
        // 1. JSON'u ayıkla
        const clean = aiResult.replace(/```json|```/g, "").trim();
        const match = clean.match(/\{[\s\S]*\}/);

        if (!match) {
            return {
                displayText: aiResult,
                eventId: eventId || null,
                questions: []
            };
        }

        const parsed = JSON.parse(match[0]);

        let savedId = eventId;

        if (savedId) {
            // 🔄 Follow-up: mevcut kaydı güncelle
            await addFollowUpToEvent(savedId, {
                text: parsed.summary || parsed.followup || "Ek bilgi",
                advice: parsed.advice,
                image_url: imageUri,
                date: parsed.date,        // varsa olayın başlama tarihi
                duration: parsed.duration, // varsa süresi
                summary: parsed.summary // varsa süresi

            });
        } else {
            let payload: any = {
                category: parsed.category || "Diğer",
                title: parsed.title || "Sağlık Kaydı",
                details: parsed.details || "AI tarafından analiz edilen sağlık olayı",
                advice: parsed.advice,
               duration :parsed.duration,
                summary :parsed.summary,


                date: new Date().toISOString(),
            };

            if (imageUri) {
                payload.image_url = imageUri;
            }

            savedId = await saveHealthEvent(payload);

        }

        // 3. Kullanıcı için formatlanmış metin
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
            eventId: eventId || null,
            questions: []
        };
    }
}
