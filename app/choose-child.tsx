import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    Image,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/src/context/ThemeContext";

export default function ChooseChildScreen() {
    const { commonStyles } = useTheme();
    const [children, setChildren] = useState<any[]>([]);

    const loadChildren = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        const { data, error } = await supabase
            .from("children")
            .select("*")
            .eq("parent_id", user.id);

        if (error) {
            Alert.alert("Hata", "Çocuklar yüklenemedi");
        } else {
            setChildren(data || []);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadChildren();
        }, [])
    );

    const selectChild = async (childId: string) => {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update({ selected_child_id: childId })
            .eq("id", user.id);

        if (error) {
            Alert.alert("Hata", "Çocuk seçilemedi");
            return;
        }

        Alert.alert("Başarılı", "Çocuk seçildi");
        router.replace("/(tabs)/home");
    };

    return (
        <View style={commonStyles.page}>
            <Text style={commonStyles.title}>Çocuğunu Seç</Text>

            <FlatList
                data={children}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            commonStyles.childCard,
                            { flexDirection: "row", alignItems: "center" },
                        ]}
                        onPress={() => selectChild(item.id)}
                    >
                        {/* Avatar küçük yuvarlak */}
                        {item.avatar ? (
                            <Image
                                source={{ uri: item.avatar }}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    marginRight: 12,
                                    borderWidth: 1,
                                    borderColor: "#d1d5db",
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    marginRight: 12,
                                    backgroundColor: "#e5e7eb",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: "#6b7280", fontSize: 18 }}>👶</Text>
                            </View>
                        )}

                        {/* Çocuk bilgileri */}
                        <View>
                            <Text style={commonStyles.childName}>{item.name}</Text>
                            <Text style={commonStyles.childDetail}>
                                {item.birthdate}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 20 }}>
                        Henüz çocuk eklenmemiş
                    </Text>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}
