import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    FlatList,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentChildWithDetails } from "@/services/children";
import { analyzeText } from "@/src/api/gemini";
import { GROWTH_VIEW_PROMPT } from "@/src/prompts";
import { commonStyles } from "@/src/styles/common";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function GrowthView() {
    const [child, setChild] = useState<any>(null);
    const [summary, setSummary] = useState<string>("");
    const [growthAnalysis, setGrowthAnalysis] = useState<string>("");
    const [sleepAnalysis, setSleepAnalysis] = useState<string>("");
    const [cognitive, setCognitive] = useState<{ description: string; activities: string[] }>({
        description: "",
        activities: [],
    });
    const [activities, setActivities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCard, setOpenCard] = useState<string | null>(null);

    const CACHE_KEY = "growth_view_cache";

    useEffect(() => {
        (async () => {
            setLoading(true);

            // 📦 1. Cache varsa göster
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setSummary(parsed.summary || "");
                    setGrowthAnalysis(parsed.growth_analysis || "");
                    setSleepAnalysis(parsed.sleep_analysis || "");
                    setCognitive(parsed.cognitive || { description: "", activities: [] });
                    setActivities(parsed.activities || []);
                    setLoading(false);
                } catch (e) {
                    console.warn("❌ Growth cache parse hatası:", e);
                }
            }

            // 📡 2. Güncel veriyi çek
            try {
                const c = await getCurrentChildWithDetails();
                setChild(c);

                if (c?.birthdate) {
                    const birth = new Date(c.birthdate);
                    const today = new Date();
                    const ageMonths =
                        (today.getFullYear() - birth.getFullYear()) * 12 +
                        (today.getMonth() - birth.getMonth());

                    const prompt = GROWTH_VIEW_PROMPT(c, ageMonths);
                    const aiResult = await analyzeText(prompt);
                    const clean = aiResult.replace(/```json|```/g, "").trim();
                    const parsed = JSON.parse(clean);

                    setSummary(parsed.summary || "");
                    setGrowthAnalysis(parsed.growth_analysis || "");
                    setSleepAnalysis(parsed.sleep_analysis || "");
                    setCognitive(parsed.cognitive || { description: "", activities: [] });
                    setActivities(parsed.activities || []);

                    // 📦 Cache güncelle
                    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
                }
            } catch (err) {
                console.error("❌ Growth API hatası:", err);
            }

            setLoading(false);
        })();
    }, []);

    const toggleCard = (key: string) => {
        LayoutAnimation.easeInEaseOut();
        setOpenCard(openCard === key ? null : key);
    };

    const renderCard = (title: string, key: string, content: any, emoji: string) => (
        <TouchableOpacity
            key={key}
            style={commonStyles.tipCard}
            activeOpacity={0.8}
            onPress={() => toggleCard(key)}
        >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={commonStyles.tipTitle}>
                    {emoji} {title}
                </Text>
                <Ionicons
                    name={openCard === key ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#555"
                />
            </View>

            {openCard === key && (
                <View style={{ marginTop: 10 }}>
                    {/* Eğer cognitive ise özel işleme */}
                    {key === "cognitive" ? (
                        <>
                            {content.description ? (
                                <Text style={[commonStyles.tipText, { marginBottom: 8 }]}>
                                    {content.description}
                                </Text>
                            ) : null}
                            {(content.activities || []).map((item: string, idx: number) => (
                                <View
                                    key={idx}
                                    style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
                                >
                                    <Ionicons
                                        name="chatbubble-ellipses-outline"
                                        size={16}
                                        color="#5c4033"
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={commonStyles.tipText}>{item}</Text>
                                </View>
                            ))}
                        </>
                    ) : Array.isArray(content) ? (
                        content.map((item, idx) => (
                            <View
                                key={idx}
                                style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
                            >
                                <Ionicons
                                    name="sparkles-outline"
                                    size={16}
                                    color="#5c4033"
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={commonStyles.tipText}>{item}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={commonStyles.tipText}>{content}</Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    if (!child) {
        return (
            <View style={commonStyles.page}>
                <Text style={commonStyles.headerTitle}>🌱 Büyüme & Gelişme</Text>
                <Text style={commonStyles.emptyText}>Çocuk bilgisi bulunamadı</Text>
            </View>
        );
    }

    if (loading && !summary) {
        return (
            <View style={commonStyles.page}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View
                style={[
                    commonStyles.header,
                    { flexDirection: "row", alignItems: "center", justifyContent: "center" },
                ]}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        marginTop: 45,
                        position: "absolute",
                        left: 8,
                        justifyContent: "center",
                        height: "100%",
                        paddingHorizontal: 8,
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color="#000000" />
                </TouchableOpacity>

                <Text style={commonStyles.headerTitle}>🌱 {child.name} için Büyüme & Gelişme</Text>
            </View>

            <FlatList
                style={[commonStyles.page, { marginTop: 12 }]}
                data={["growth", "sleep", "cognitive", "activities"]}
                keyExtractor={(item) => item}
                ListHeaderComponent={
                    summary ? (
                        <View style={commonStyles.summaryCard}>
                            <Text style={commonStyles.summaryTitle}>📌 Genel Özet</Text>
                            <Text style={commonStyles.summaryText}>{summary}</Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => {
                    if (item === "growth")
                        return renderCard("Boy-Kilo Analizi", "growth", growthAnalysis, "📏");
                    if (item === "sleep")
                        return renderCard("Uyku Önemi", "sleep", sleepAnalysis, "😴");
                    if (item === "cognitive")
                        return renderCard("Konuşma & Zeka Gelişimi", "cognitive", cognitive, "🗣️");
                    if (item === "activities")
                        return renderCard("Aktivite & Oyun Önerileri", "activities", activities, "🎲");
                    return null;
                }}
                contentContainerStyle={{ paddingBottom: 30 }}
            />
        </View>
    );
}
