import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Props = {
    title: string;
    subtitle?: string;
    details?: string;
    imageUrl?: string;
    records?: any[];
    variant?: "default" | "full";
};

export default function CardButton({
                                       title,
                                       subtitle,
                                       details,
                                       imageUrl,
                                       records = [],
                                       variant = "default",
                                   }: Props) {
    return (
        <Pressable
            onPress={() =>
                router.push({
                    pathname: "/categories/category",
                    params: {
                        category: title,
                        records: JSON.stringify(records), // ✅ dizi parametreye string olarak
                    },
                })
            }
            style={[styles.card, variant === "full" && styles.fullCard]}
        >
            {/* süs daireler */}
            <View
                style={[styles.circle, { backgroundColor: "#312e81", top: -50, right: -30 }]}
            />
            <View
                style={[styles.circle, { backgroundColor: "#4f46e5", top: -80, right: -40 }]}
            />

            <View style={{ zIndex: 2 }}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                ) : null}
            </View>

            <Pressable style={styles.menuBtn}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
            </Pressable>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 200,
        height: 120,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        overflow: "hidden",
        justifyContent: "center",
        backgroundColor: "#1e3a8a",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    fullCard: {
        width: "100%",
        height: 160,
        marginRight: 0,
        marginTop: 12,
    },
    circle: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.25,
    },
    menuBtn: { position: "absolute", top: 10, right: 10, zIndex: 3 },
    title: { fontSize: 18, fontWeight: "700", color: "#fff" },
    subtitle: { fontSize: 14, color: "#c7d2fe", marginTop: 2 },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginTop: 8,
    },
});
