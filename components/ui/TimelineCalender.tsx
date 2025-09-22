import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { commonStyles } from "@/src/styles/common";

export type HealthCategory =
    | "vaccines"
    | "weight"
    | "illness"
    | "allergy"
    | "labs";

export interface HealthCard {
    id: string;
    childId: string;
    category: HealthCategory;
    title: string;
    subtitle?: string;
    dateISO: string;
    summary?: string;
    advice?: string;
    image_url?: string;
}

const categoryColor: Record<HealthCategory, string> = {
    vaccines: "#b47e5d", // ✅ common accent
    weight: "#16a34a",
    illness: "#dc2626",
    allergy: "#f59e0b",
    labs: "#5c4033", // ✅ kahverengi
};

type Props = { items: HealthCard[] };

export default function Timeline({ items }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (items.length === 0) {
        return <Text style={commonStyles.emptyText}>Henüz kayıt bulunmuyor</Text>;
    }

    return (
        <View style={{ marginTop: 10 }}>
            <Text style={commonStyles.sectionTitle}>📋 Son Kayıtlar</Text>
            <FlatList
                data={items}
                keyExtractor={(item, index) => String(item.id || index)}
                renderItem={({ item, index }) => {
                    const isOpen = openIndex === index;
                    return (
                        <TouchableOpacity
                            style={commonStyles.vaccineCard}
                            activeOpacity={0.8}
                            onPress={() => setOpenIndex(isOpen ? null : index)}
                        >
                            {/* Başlık + tarih */}
                            <View style={commonStyles.recordHeader}>
                                <View
                                    style={{ flexDirection: "row", alignItems: "center" }}
                                >
                                    <View
                                        style={[
                                            commonStyles.statusDot,
                                            { backgroundColor: categoryColor[item.category] },
                                        ]}
                                    />
                                    <Text style={commonStyles.vaccineTitle}>{item.title}</Text>
                                    {item.dateISO && (
                                        <Text style={commonStyles.recordSub}>  •  {item.dateISO}</Text>
                                    )}
                                </View>
                            </View>

                            {/* Açılınca detaylar */}
                            {isOpen && (
                                <>
                                    {item.summary ? (
                                        <Text style={commonStyles.vaccineDesc}>
                                            {item.summary}
                                        </Text>
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
                scrollEnabled={false}   // ✅ dış ScrollView kaydırsın

            />
        </View>
    );
}
