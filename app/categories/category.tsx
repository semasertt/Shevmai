// app/categories/[category].tsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, Image } from "react-native";
import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";

export default function CategoryPage() {
    const { category } = useLocalSearchParams<{ category: string }>();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const childId = await getSelectedChild();
            if (!childId) return;

            const { data, error } = await supabase
                .from("health_events")
                .select("*")
                .eq("child_id", childId)
                .eq("category", category)
                .order("date", { ascending: false });

            if (error) console.error(error);
            else setItems(data ?? []);

            setLoading(false);
        })();
    }, [category]);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    // @ts-ignore
    // @ts-ignore
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
                {category?.toUpperCase()}
            </Text>
            <FlatList
                data={Array.isArray(items) ? items : []} // ✅ items kullanılmalı
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 12,
                            borderBottomWidth: 1,
                            borderColor: "#eee",
                        }}
                    >
                        <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                            {item.title}
                        </Text>

                        {item.details ? <Text>{item.details}</Text> : null}

                        {item.image_url ? (
                            <Image
                                source={{ uri: item.image_url }}
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 8,
                                    marginTop: 8,
                                }}
                            />
                        ) : null}
                    </View>
                )}
            />


        </View>
    );
}
