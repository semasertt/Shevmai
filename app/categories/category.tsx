import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, FlatList, Image, ScrollView } from "react-native";
import { VaccineScheduleView } from "@/components/VaccineScheduleView";
import { AttackPeriodsView } from "@/components/AttackPeriodsView";

export default function CategoryPage() {
    const { category, records } = useLocalSearchParams<{ category: string; records?: string }>();

    // gelen stringi tekrar diziye çevir
    let parsedRecords: any[] = [];
    try {
        if (records) parsedRecords = JSON.parse(records);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    // 💉 Aşı veya ⚡ Atak Dönemleri özel davranış
    if (category === "💉 Aşı") {
        return <VaccineScheduleView />;
    }
    if (category === "⚡ Atak Dönemleri") {
        return <AttackPeriodsView />;
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 30 }}>
            <Text style={styles.title}>{category}</Text>

            {parsedRecords.length > 0 ? (
                <FlatList
                    data={parsedRecords}
                    keyExtractor={(item, index) => String(item.id || index)}
                    renderItem={({ item }) => (
                        <View style={styles.recordItem}>
                            <Text style={styles.recordTitle}>{item.title}</Text>
                            {item.advice ? (
                                <Text style={styles.recordText}>{item.advice}</Text>
                            ) : null}
                            {item.image_url ? (
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={styles.recordImage}
                                    resizeMode="cover"
                                />
                            ) : null}
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.empty}>Henüz kayıt yok</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#0f172a" }, // ✅ HomeScreen ile aynı koyu arka plan
    title: {
        fontSize: 24,              // 🔹 Daha büyük
        fontWeight: "800",         // 🔹 Daha kalın
        marginBottom: 20,
        color: "#facc15",          // 🔹 Sarı (arka planda çok dikkat çeker)
        textAlign: "center"        // 🔹 Ortalayıp daha güçlü görünüm
    },

    recordItem: {
        backgroundColor: "#1e293b", // ✅ koyu kart
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 16,
    },
    recordTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff"
    },
    recordText: {
        fontSize: 14,
        color: "#cbd5e1",
        marginTop: 6
    },
    empty: {
        textAlign: "center",
        marginTop: 20,
        color: "#94a3b8"
    },
    recordImage: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        marginTop: 10,
    },
});
