import {router, useLocalSearchParams} from "expo-router";

import {View, Text, StyleSheet, FlatList, Image, StatusBar, TouchableOpacity} from "react-native";
import {commonStyles} from "@/src/styles/common";
import {VaccineScheduleView} from "@/app/categories/VaccineScheduleView";
import {AttackPeriodsView} from "@/app/categories/AttackPeriodsView";
import {Ionicons} from "@expo/vector-icons";
import React, { useState } from "react";

export default function CategoryPage() {
    const { category, records } = useLocalSearchParams<{ category: string; records?: string }>();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={commonStyles.header}>
                <Text style={commonStyles.headerTitle}>{category}</Text>
            </View>

            {parsedRecords.length > 0 ? (
                <FlatList
                    data={parsedRecords}
                    keyExtractor={(item, index) => String(item.id || index)}
                    contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
                    renderItem={({ item, index }) => {
                        const isOpen = openIndex === index;

                        return (
                            <TouchableOpacity
                                style={commonStyles.vaccineCard}
                                activeOpacity={0.8}
                                onPress={() => setOpenIndex(isOpen ? null : index)}
                            >
                                {/* Başlık */}
                                <View style={commonStyles.recordHeader}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Text style={commonStyles.vaccineTitle}>{item.title}</Text>
                                        {item.date && (
                                            <Text style={commonStyles.recordSub}>  •  {item.date}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Açıldığında detaylar */}
                                {isOpen && (
                                    <>
                                        {item.advice ? (
                                            <Text style={commonStyles.vaccineDesc}>{item.advice}</Text>
                                        ) : null}

                                        {item.image_url ? (
                                            <Image
                                                source={{ uri: item.image_url }}
                                                style={commonStyles.recordImage}
                                                resizeMode="cover"
                                            />
                                        ) : null}
                                    </>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            ) : (
                <Text style={commonStyles.emptyText}>Henüz kayıt yok</Text>
            )}
        </View>
    );
}


