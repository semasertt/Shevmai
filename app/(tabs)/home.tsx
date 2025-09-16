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

const DEFAULT_CATEGORIES = [
    { id: "c1", title: "Hastalıklar" },
    { id: "c2", title: "Boy-Kilo Analizleri" },
    { id: "c3", title: "Doktor Notları" },
    { id: "c4", title: "İlaçlar" },
    { id: "c5", title: "Tahlil Sonuçları" },
];

export default function HomeScreen() {
    const [records, setRecords] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const childId = await getSelectedChild();
            if (!childId) return;

            const { data, error } = await supabase
                .from("health_events")
                .select("*")
                .eq("child_id", childId)
                .order("created_at", { ascending: false });

            if (!error && data) setRecords(data);
        })();
    }, []);

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
                        records={records.filter(
                            (r) =>
                                r.category.toLowerCase() ===
                                item.title.toLowerCase()
                        )}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />

            {/* 📌 Takvim */}
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

            {/* 📌 Sağlık Özeti */}
            <Text style={styles.sectionTitle}>Sağlık Özeti</Text>
            <View style={{ paddingHorizontal: 16 }}>
                <CardButton
                    title="Genel Sağlık Durumu"
                    subtitle="Son kontrol: Normal"
                    details={`Çocuğun genel sağlık durumu iyi 👍
Kilo ve boy gelişimi percentile aralığında.
Aşı takvimi güncel.`}
                    variant="full"
                />
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
