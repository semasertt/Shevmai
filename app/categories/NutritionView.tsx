import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    Platform,
} from "react-native";
import { getCurrentChildWithDetails } from "@/services/children";
import { analyzeText } from "@/src/api/gemini";
import { DAILY_NUTRITION_PROMPT } from "@/src/prompts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function NutritionView() {
    const { commonStyles, theme } = useTheme();
    const [child, setChild] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState<string>("");
    const [meals, setMeals] = useState<any>({
        kahvalti: [],
        ogle: [],
        aksam: [],
        ara: [],
    });
    const [openMeal, setOpenMeal] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const c = await getCurrentChildWithDetails();
            setChild(c);
            if (!c) return;

            const CACHE_KEY = `nutrition_daily_${c.id}`;
            setLoading(true);

            // 📦 Önce cache oku
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setSummary(parsed.summary || "");
                    setMeals(parsed.meals || {});
                    setLoading(false);
                } catch (e) {
                    console.warn("❌ Nutrition cache parse hatası:", e);
                }
            }

            try {
                const prompt = DAILY_NUTRITION_PROMPT(c);
                const aiResult = await analyzeText(prompt);
                const clean = aiResult.replace(/```json|```/g, "").trim();

                const parsed = JSON.parse(clean);
                setSummary(parsed.summary || "");
                setMeals(parsed.meals || {});

                // 📦 Cache güncelle
                await AsyncStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify({ summary: parsed.summary, meals: parsed.meals })
                );
            } catch (err) {
                console.error("❌ Nutrition API hatası:", err);
            }

            setLoading(false);
        })();
    }, []);

    const toggleMeal = (meal: string) => {
        LayoutAnimation.easeInEaseOut();
        setOpenMeal(openMeal === meal ? null : meal);
    };

    const renderMealCard = (title: string, mealKey: string, emoji: string) => (
        <TouchableOpacity
            key={mealKey}
            activeOpacity={0.8}
            style={commonStyles.tipCard}
            onPress={() => toggleMeal(mealKey)}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Text style={commonStyles.tipTitle}>
                    {emoji} {title}
                </Text>
                <Ionicons
                    name={openMeal === mealKey ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#555"
                />
            </View>

            {openMeal === mealKey && (
                <View style={{ marginTop: 10 }}>
                    {(meals[mealKey] || []).map((item: string, idx: number) => (
                        <View
                            key={idx}
                            style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
                        >
                            <Ionicons
                                name="restaurant-outline"
                                size={16}
                                color="#5c4033"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={commonStyles.tipText}>{item}</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* 📌 Header */}
            <View
                style={[
                    commonStyles.header,
                    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
                ]}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ padding: 8, width: 40, alignItems: "flex-start" }}
                >
                    <Ionicons name="arrow-back" size={24} color="#111111" />
                </TouchableOpacity>

                <Text style={[commonStyles.headerTitle, { flex: 1, textAlign: "center" }]}>
                    🍎 Beslenme Planı
                </Text>

                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                {loading ? (
                    <View style={{ alignItems: "center", marginTop: 30 }}>
                        <ActivityIndicator size="large" color="#5c4033" />
                        <Text style={commonStyles.detail}>🥗 Öneriler hazırlanıyor...</Text>
                    </View>
                ) : (
                    <>
                        {summary ? (
                            <View style={commonStyles.summaryCard}>
                                <Text style={commonStyles.summaryTitle}>📌 Genel Özet</Text>
                                <Text style={commonStyles.summaryText}>{summary}</Text>
                            </View>
                        ) : null}

                        {renderMealCard("Kahvaltı", "kahvalti", "🍳")}
                        {renderMealCard("Öğle", "ogle", "🍲")}
                        {renderMealCard("Akşam", "aksam", "🍽️")}
                        {renderMealCard("Ara Öğün", "ara", "🍏")}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
