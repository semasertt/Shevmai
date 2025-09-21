import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    FlatList,
    StyleSheet,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";
import CardButton from "../../components/ui/CardButton";
import Timeline from "@/components/ui/TimelineCalender";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";


const DEFAULT_CATEGORIES = [
    { id: "disease", title: "🤒 Hastalık" },
    { id: "vaccine", title: "💉 Aşı" },
    { id: "symptom", title: "🌡️ Semptom" },
    { id: "nutrition", title: "🍎 Beslenme" },
    { id: "sleep", title: "😴 Uyku" },
    { id: "test", title: "🧪 Tahlil Sonuçları" },
    { id: "attack", title: "⚡ Atak Dönemleri" },
    { id: "other", title: "📝 Diğer" },
];

export default function HomeScreen() {
    const { commonStyles } = useTheme();
    const router = useRouter();
    const [records, setRecords] = useState<any[]>([]);
    const [recordsByCategory, setRecordsByCategory] = useState<{ [key: string]: any[] }>({});

    useEffect(() => {
        loadHealthEvents();
    }, []);

    const loadHealthEvents = async () => {
        const childId = await getSelectedChild();
        if (!childId) return;

        const {data, error} = await supabase
            .from("health_events")
            .select("*")
            .eq("child_id", childId)
            .order("created_at", {ascending: false});

        if (!error && data) {
            setRecords(data);
            groupRecordsByCategory(data);
        }
    };

    const groupRecordsByCategory = (data: any[]) => {
        const grouped: { [key: string]: any[] } = {};

        DEFAULT_CATEGORIES.forEach(cat => {
            grouped[cat.title] = [];
        });

        grouped["📝 Diğer"] = [];

        data.forEach((rec) => {
            const categoryTitle = findCategoryTitle(rec.category);
            if (!grouped[categoryTitle]) {
                grouped[categoryTitle] = [];
            }
            grouped[categoryTitle].push(rec);
        });

        setRecordsByCategory(grouped);
    };

    const findCategoryTitle = (category: string | null): string => {
        if (!category) return "📝 Diğer";

        const found = DEFAULT_CATEGORIES.find(
            cat => cat.title.toLowerCase().includes(category.toLowerCase()) ||
                category.toLowerCase().includes(cat.title.toLowerCase())
        );

        return found ? found.title : "📝 Diğer";
    };

    const handleCategoryPress = (categoryTitle: string) => {
        const categoryRecords = recordsByCategory[categoryTitle] || [];

        router.push({
            pathname: "/categories/category",
            params: {
                category: categoryTitle,
                records: JSON.stringify(categoryRecords)
            }
        });
    };

    return (
        <>
            {/* 📌 Header */}
            <SafeAreaView style={commonStyles.safeArea}>
                <View style={commonStyles.header}>
                    <Text style={commonStyles.headerTitle}>Anasayfa</Text>
                </View>
            </SafeAreaView>

            {/* 📌 İçerik */}
            <ScrollView
                style={commonStyles.page}
                contentContainerStyle={{paddingLeft: 16,paddingRight: 16, paddingBottom: 30}}
            >
                {/* 📌 Kategoriler */}
                <Text style={[commonStyles.sectionTitle, {marginTop: 24}]}>Kategoriler</Text>
                <FlatList
                    data={DEFAULT_CATEGORIES}
                    horizontal
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <CardButton
                            title={item.title}
                            records={recordsByCategory[item.title] || []}
                            onPress={() => handleCategoryPress(item.title)}
                        />
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 16}}
                />

                {/* 📌 Son Kayıtlar */}
                <Text style={[commonStyles.sectionTitle, {marginTop: 24}]}>Son Kayıtlar</Text>
                <Timeline items={records}/>
            </ScrollView>
        </>
    );
}