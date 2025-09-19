import { useLocalSearchParams } from "expo-router";
import {View, Text, StyleSheet, FlatList, Image} from "react-native";
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
        <View style={styles.page}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, padding: 16, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
    recordItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    recordTitle: { fontSize: 16, fontWeight: "600" },
    recordText: { fontSize: 14, color: "#444", marginTop: 4 },
    empty: { textAlign: "center", marginTop: 20, color: "#888" },
    recordImage: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        marginTop: 8,
    },
});
