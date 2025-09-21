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
import { getSelectedChild, setSelectedChild } from "@/services/children";
import CardButton from "../../components/ui/CardButton";
import Timeline from "@/components/ui/TimelineCalender";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


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

    useFocusEffect(
        useCallback(() => {
            loadHealthEvents(); // ekran her göründüğünde yeniden çek
        }, [])
    );


    const loadHealthEvents = async () => {
        // ✅ Önce localden oku
        let childId = await getSelectedChild();
        console.log("📦 Localden gelen childId:", childId);

        if (!childId) {
            // ✅ Local boşsa DB’den al
            let childId = await getSelectedChild();

            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("selected_child_id")
                    .eq("id", userData.user.id)
                    .single();

                if (profile?.selected_child_id && profile.selected_child_id !== childId) {
                    childId = profile.selected_child_id;
                    if(childId){
                        await setSelectedChild(childId); // ✅ local güncelle

                    }
                }
            }

        }

        if (!childId) {
            console.log("❌ childId hala bulunamadı, sorgu yapılmayacak");
            return;
        }


        const { data, error } = await supabase
            .from("health_events")
            .select("*")
            .eq("child_id", childId) // filtre
            .order("created_at", { ascending: false });


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
            <View style={commonStyles.safeArea}>
                <View style={commonStyles.header}>
                    <Text style={commonStyles.headerTitle}>Anasayfa</Text>
                </View>
            </View>

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
                    scrollEnabled={true}
                />

                {/* 📌 Son Kayıtlar */}
                <Timeline items={records}/>
            </ScrollView>
        </>
    );
}