import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Modal,
    TouchableOpacity,
    FlatList,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    title: string;
    subtitle?: string;
    details?: string;
    imageUrl?: string;
    records?: any[]; // kategoriye ait tüm kayıtlar
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
    const [open, setOpen] = useState(false);

    // 🔹 kayıtları en yeni → en eski sırala
    const sortedRecords = [...records].sort(
        (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <>
            {/* Kart */}
            <Pressable
                onPress={() => setOpen(true)}
                style={[
                    styles.card,
                    variant === "full" && styles.fullCard,
                ]}
            >
                {/* süs daireler */}
                <View
                    style={[
                        styles.circle,
                        { backgroundColor: "#312e81", top: -50, right: -30 },
                    ]}
                />
                <View
                    style={[
                        styles.circle,
                        { backgroundColor: "#4f46e5", top: -80, right: -40 },
                    ]}
                />

                <View style={{ zIndex: 2 }}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                    ) : null}
                </View>

                {/* 3 nokta */}
                <Pressable style={styles.menuBtn} onPress={() => setOpen(true)}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </Pressable>
            </Pressable>

            {/* Modal */}
            <Modal visible={open} animationType="slide">
                <View style={styles.modalContent}>
                    {/* Kapat */}
                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={() => setOpen(false)}
                    >
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>{title}</Text>

                    {sortedRecords.length > 0 ? (
                        <FlatList
                            data={sortedRecords}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <View style={styles.recordItem}>
                                    <Text style={styles.recordTitle}>
                                        {item.title}
                                    </Text>
                                    {item.advice ? (
                                        <Text style={styles.recordText}>
                                            {item.advice}
                                        </Text>
                                    ) : null}
                                    {item.image_url ? (
                                        <Image
                                            source={{ uri: item.image_url }}
                                            style={styles.recordImage}
                                        />
                                    ) : null}
                                </View>
                            )}
                        />
                    ) : details ? (
                        // Sağlık Özeti gibi tek detay gösterilecek kart
                        <Text style={styles.recordText}>{details}</Text>
                    ) : (
                        <Text>Henüz kayıt yok</Text>
                    )}
                </View>
            </Modal>
        </>
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
    modalContent: { flex: 1, padding: 20, backgroundColor: "#fff" },
    closeBtn: { position: "absolute", top: 10, right: 10 },
    modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
    recordItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    recordTitle: { fontWeight: "600", marginBottom: 4 },
    recordText: { fontSize: 14, color: "#333" },
    recordImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginTop: 8,
    },
});
