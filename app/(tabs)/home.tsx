import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";
import CardButton from "../../components/ui/CardButton";
import { useRouter } from "expo-router";

const DEFAULT_CATEGORIES = [
    { id: "medicine", title: "💊 İlaçlar" },
    { id: "fever", title: "🌡️ Ateş" },
    { id: "measurement", title: "📏 Boy/Kilo" },
    { id: "test", title: "🧪 Tahlil Sonuçları" },
    { id: "symptom", title: "🤒 Hastalık/Belirti" },
    { id: "nutrition", title: "🍎 Beslenme" },
    { id: "sleep", title: "😴 Uyku" },
    { id: "vaccine", title: "💉 Aşılar" },
    { id: "emergency", title: "🚨 Acil Durum" },
    { id: "other", title: "📝 Diğer" },
];

export default function HomeScreen() {
    const router = useRouter();
    const [records, setRecords] = useState<any[]>([]);
    const [recordsByCategory, setRecordsByCategory] = useState<{ [key: string]: any[] }>({});

    useEffect(() => {
        loadHealthEvents();
    }, []);

    const loadHealthEvents = async () => {
        const childId = await getSelectedChild();
        if (!childId) return;

        const { data, error } = await supabase
            .from("health_events")
            .select("*")
            .eq("child_id", childId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setRecords(data);
            groupRecordsByCategory(data);
        }
    };

    const groupRecordsByCategory = (data: any[]) => {
        const grouped: { [key: string]: any[] } = {};

        // Önce tüm kategorileri boş array olarak oluştur
        DEFAULT_CATEGORIES.forEach(cat => {
            grouped[cat.title] = [];
        });

        // "Diğer" kategorisini de ekle
        grouped["📝 Diğer"] = [];

        // Kayıtları kategorilere göre grupla
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

// HomeScreen.tsx - handleCategoryPress fonksiyonunu güncelle
    const handleCategoryPress = (categoryTitle: string) => {
        const categoryRecords = recordsByCategory[categoryTitle] || [];

        console.log("📤 Gönderilen kayıt sayısı:", categoryRecords.length);
        console.log("📤 Gönderilen kategori:", categoryTitle);

        router.push({
            pathname: "/categories/category",
            params: {
                category: categoryTitle,
                records: JSON.stringify(categoryRecords) // ← Kayıtları gönder
            }
        });
    };
    return (
        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* 📌 Kategoriler */}
            <Text style={styles.sectionTitle}>Kategoriler</Text>
            <FlatList
                data={DEFAULT_CATEGORIES}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CardButton
                        title={item.title}
                        records={recordsByCategory[item.title] || []}
                        // ✅ SADECE BURAYI DEĞİŞTİRDİK:
                        onPress={() => handleCategoryPress(item.title)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />

            {/* 📌 Sağlık Özeti */}
            <Text style={styles.sectionTitle}>Sağlık Özeti</Text>
            <View style={{ paddingHorizontal: 16 }}>
                <CardButton
                    title="Genel Sağlık Durumu"
                    subtitle={`Toplam ${records.length} kayıt`}
                    variant="full"
                />
            </View>

            {/* 📌 Takvim
            <Text style={styles.sectionTitle}>Takvim</Text>
            <View style={styles.calendarWrap}>
                <Calendar
                    current={new Date().toISOString().slice(0, 10)}
                    markedDates={records.reduce((acc, r) => {
                        const date = r.created_at.slice(0, 10);
                        acc[date] = { marked: true, dotColor: "#3b82f6" };
                        return acc;
                    }, {} as any)}
                    theme={{
                        backgroundColor: "#fff",
                        calendarBackground: "#fff",
                        selectedDayBackgroundColor: "#3b82f6",
                        selectedDayTextColor: "#fff",
                        todayTextColor: "#3b82f6",
                        arrowColor: "#3b82f6",
                        monthTextColor: "#111827",
                    }}
                />
            </View>
*/}
            {/* 📌 Son Kayıtlar */}
            <Text style={styles.sectionTitle}>Son Kayıtlar</Text>
            <View style={{ paddingHorizontal: 16 }}>
                {records.slice(0, 3).map((record, index) => (
                    <CardButton
                        key={record.id}
                        title={record.title}
                        subtitle={record.details}
                        variant="full"
                        style={index > 0 ? { marginTop: 8 } : {}}
                    />
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#0f172a" },
    sectionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginVertical: 12,
        marginLeft: 16,
    },
    calendarWrap: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        padding: 8,
        elevation: 3,
    },
});