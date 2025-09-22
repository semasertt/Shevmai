import {router, useLocalSearchParams} from "expo-router";

import {View, Text, StyleSheet, FlatList, Image, StatusBar, TouchableOpacity} from "react-native";
import {commonStyles} from "@/src/styles/common";
import {VaccineScheduleView} from "@/app/categories/VaccineScheduleView";
import {AttackPeriodsView} from "@/app/categories/AttackPeriodsView";
import { NutritionView } from "@/app/categories/NutritionView";
import { GrowthView } from "@/app/categories/GrowthView";

import {Ionicons} from "@expo/vector-icons";
import React, { useState } from "react";



export default   function CategoryPage() {
    const {category, records} = useLocalSearchParams<{ category: string; records?: string }>();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // gelen stringi tekrar diziye çevir
    let parsedRecords: any[] = [];
    try {
        if (records) parsedRecords = JSON.parse(records);
    } catch (e) {
        console.error("JSON parse error:", e);
    }
    console.log("🟢 CategoryPage render edildi");
    console.log("➡️ category param:", category);
    console.log("➡️ records raw param:", records);
    console.log("➡️ parsedRecords:", parsedRecords);    //  özel davranış
    if (category === "💉 Aşı") {
        return <VaccineScheduleView/>;
    }
    if (category === "⚡ Atak Dönemleri") {
        return <AttackPeriodsView/>;
    }
    if (category === "🍎 Beslenme") {
        return <NutritionView/>;
    }
    if (category === "🌱 Büyüme & Gelişme") {
        return <GrowthView/>;
    }
    return (
        <View style={{flex: 1}}>
            {/* Header */}
            <View style={[commonStyles.header, {flexDirection: "row", alignItems: "center"}]}>
                <TouchableOpacity onPress={() => router.back()} style={{padding: 8, marginRight: 8}}>
                    <Ionicons name="arrow-back" size={24} color="#111111"/>
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>{category}</Text>

                <View style={{ width: 60 }} />
            </View>

            {parsedRecords.length > 0 ? (
                <FlatList
                    data={parsedRecords}
                    keyExtractor={(item, index) => String(item.id || index)}
                    contentContainerStyle={{padding: 16, paddingBottom: 30}}
                    renderItem={({item, index}) => {
                        const isOpen = openIndex === index;

                        return (
                            <TouchableOpacity
                                style={commonStyles.vaccineCard}
                                activeOpacity={0.8}
                                onPress={() => setOpenIndex(isOpen ? null : index)}
                            >
                                {/* Başlık */}
                                <View style={commonStyles.recordHeader}>
                                    <View style={{flexDirection: "row", alignItems: "center"}}>
                                        <Text style={commonStyles.vaccineTitle}>{item.title}</Text>
                                        {item.date && (
                                            <Text style={commonStyles.recordSub}> • {item.date}</Text>
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
                                                source={{uri: item.image_url}}
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


