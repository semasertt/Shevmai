import React from "react";
import { View, Text, StyleSheet, Image, ViewStyle, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    title: string;
    subtitle?: string;
    variant?: 'default' | 'full';
    records?: any[];
    categoryId?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export default function CardButton({
                                       title,
                                       subtitle,
                                       variant = 'default',
                                       records = [],
                                       categoryId,
                                       onPress,
                                       style
                                   }: Props) {

    const containerStyle = variant === 'full' ? styles.fullContainer : styles.container;

    return (
        <TouchableOpacity
            style={[containerStyle, style]}
            onPress={onPress}
        >
            {/* ✅ Arkaplan süs daireleri - Sadece default variant için */}
            {variant === 'default' && (
                <>
                    <View
                        style={[styles.circle, { backgroundColor: "#312e81", top: -50, right: -30 }]}
                    />
                    <View
                        style={[styles.circle, { backgroundColor: "#4f46e5", top: -80, right: -40 }]}
                    />
                </>
            )}

            <View style={{ zIndex: 2 }}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                {records.length > 0 && (
                    <Text style={styles.count}>{records.length} kayıt</Text>
                )}
            </View>

            {/* ✅ Menü butonu - Sadece default variant için */}
            {variant === 'default' && (
                <View style={styles.menuBtn}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1e3a8a',
        padding: 16,
        borderRadius: 16,
        marginRight: 12,
        width: 140,
        height: 120,
        justifyContent: 'center',
        overflow: "hidden",
        position: "relative",
        // Gölge efekti
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    fullContainer: {
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 12,
        marginVertical: 4,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        color: '#c7d2fe',
        fontSize: 14,
    },
    count: {
        color: '#60a5fa',
        fontSize: 12,
        marginTop: 8,
    },
    // ✅ Yeni eklenen stiller
    circle: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.25,
        zIndex: 1,
    },
    menuBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 3
    },
});