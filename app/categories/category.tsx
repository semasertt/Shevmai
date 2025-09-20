import { useLocalSearchParams } from "expo-router";
import {View, Text, StyleSheet, FlatList, Image} from "react-native";
import {commonStyles} from "@/app/styles/common";

export default function CategoryPage() {
    const { category, records } = useLocalSearchParams<{ category: string; records?: string }>();

    // gelen stringi tekrar diziye çevir
    let parsedRecords: any[] = [];
    try {
        if (records) parsedRecords = JSON.parse(records);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    return (
        <View style={commonStyles.page}>
            <Text style={commonStyles.title}>{category}</Text>

            {parsedRecords.length > 0 ? (
                <FlatList
                    data={parsedRecords}
                    keyExtractor={(item, index) => String(item.id || index)}
                    renderItem={({ item }) => (
                        <View style={commonStyles.recordItem}>
                            <Text style={commonStyles.recordTitle}>{item.title}</Text>
                            {item.advice ? (
                                <Text style={commonStyles.recordText}>{item.advice}</Text>

                            ) : null}
                            {item.image_url ? (
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={commonStyles.recordImage}
                                    resizeMode="cover"
                                />
                            ) : null}
                        </View>
                    )}
                />
            ) : (
                <Text style={commonStyles.empty}>Henüz kayıt yok</Text>
            )}
        </View>
    );
}


