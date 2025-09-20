import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function ChooseChildScreen() {
    const [children, setChildren] = useState<any[]>([]);

    const loadChildren = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        const { data, error } = await supabase
            .from("children")
            .select("*")
            .eq("parent_id", user.id); // ✅ doğru kolon

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
        <View style={styles.page}>
            <Text style={styles.title}>Çocuğunu Seç</Text>

            <FlatList
                data={children}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.childCard}
                        onPress={() => selectChild(item.id)}
                    >
                        <Text style={styles.childName}>{item.name}</Text>
                        <Text style={styles.childDetail}>{item.birthdate}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
                        Henüz çocuk eklenmemiş
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
    title: { fontSize: 22, color: "#fff", fontWeight: "700", marginBottom: 16 },
    childCard: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: "#1e293b",
        marginBottom: 10,
    },
    childName: { color: "#fff", fontSize: 16, fontWeight: "600" },
    childDetail: { color: "#cbd5e1", fontSize: 14, marginTop: 4 },
});
