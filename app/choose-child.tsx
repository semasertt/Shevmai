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
import {commonStyles} from "@/app/styles/common";

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
        <View style={commonStyles.page}>
            <Text style={commonStyles.title}>Çocuğunu Seç</Text>

            <FlatList
                data={children}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={commonStyles.childCard}
                        onPress={() => selectChild(item.id)}
                    >
                        <Text style={commonStyles.childName}>{item.name}</Text>
                        <Text style={commonStyles.childDetail}>{item.birthdate}</Text>
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



