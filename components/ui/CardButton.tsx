import React from "react";
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    title: string;
    subtitle?: string;
    variant?: "default" | "full";
    records?: any[];
    categoryId?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export default function CardButton({
                                       title,
                                       subtitle,
                                       variant = "default",
                                       records = [],
                                       categoryId,
                                       onPress,
                                       style,
                                   }: Props) {
    const containerStyle = variant === "full" ? styles.fullContainer : styles.container;

    return (
        <TouchableOpacity style={[containerStyle, style]} onPress={onPress}>
            {/* Daha belirgin yarım daire gölgeler */}
            {variant === "default" && (
                <>
                    <View style={[styles.circle, { top: -60, right: -30 }]} />
                    <View style={[styles.circle, { top: -80, right: -40 }]} />
                </>
            )}

            <View style={{ zIndex: 2 }}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                {records.length > 0 && (
                    <Text style={styles.count}>{records.length} kayıt</Text>
                )}
            </View>

            {variant === "default" && (
                <View style={styles.menuBtn}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#5c4033" />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f5ede3",
        padding: 16,
        borderRadius: 16,
        marginRight: 12,
        marginBottom: 20, // ✅ altta boşluk
        width: 140,
        height: 120,
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    fullContainer: {
        backgroundColor: "#fffaf5",
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
    },
    title: {
        color: "#5c4033",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    subtitle: {
        color: "#6b7280",
        fontSize: 14,
    },
    count: {
        color: "#b47e5d",
        fontSize: 12,
        marginTop: 8,
    },
    menuBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 3,
    },
    circle: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#e0d6c8", // ✅ koyu krem
        opacity: 0.6,               // ✅ daha görünür
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        zIndex: 1,
    },
});
