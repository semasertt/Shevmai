import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { getSelectedChild } from "@/services/children";
import { router } from "expo-router";

export default function ProfileScreen() {
    const [currentChild, setCurrentChild] = useState<any>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFields, setEditFields] = useState<string[]>([]);
    const [formValues, setFormValues] = useState<any>({});

    useEffect(() => {
        const loadChild = async () => {
            const childId = await getSelectedChild();
            if (!childId) return;

            const { data, error } = await supabase
                .from("children")
                .select("*")
                .eq("id", childId)
                .single();

            if (!error && data) {
                setCurrentChild(data);
                setFormValues(data);
            }
        };

        loadChild();
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setCurrentChild((prev: any) => ({
                    ...prev,
                    avatar: result.assets[0].uri,
                }));
                Alert.alert("Başarılı", "Profil resmi değiştirildi");
            }
        } catch (error) {
            Alert.alert("Hata", "Resim yüklenirken bir hata oluştu");
        }
    };

    const saveEdit = async () => {
        if (!currentChild) return;
        const { error } = await supabase
            .from("children")
            .update(formValues)
            .eq("id", currentChild.id);

        if (!error) {
            setCurrentChild(formValues);
            Alert.alert("Başarılı", "Bilgiler güncellendi");
        } else {
            Alert.alert("Hata", "Bilgiler güncellenemedi");
        }
        setEditModalVisible(false);
    };

    const formatFieldName = (field: string) => {
        const fieldNames: { [key: string]: string } = {
            name: "İsim",
            birth_date: "Doğum Tarihi",
            height: "Boy",
            weight: "Kilo",
            sleep_pattern: "Uyku Düzeni",
            allergies: "Alerjiler",
            vaccines: "Aşılar",
            illnesses: "Hastalıklar",
        };
        return fieldNames[field] || field;
    };

    if (!currentChild) {
        return (
            <View style={styles.page}>
                <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
                    Yükleniyor...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page}>
            {/* 📌 Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
                <TouchableOpacity onPress={() => router.push("/settings" as any)}>
                    <Ionicons name="settings-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* 👤 Çocuk Bilgileri Kartı */}
            <View style={styles.card}>
                <View style={{ alignItems: "center" }}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{ uri: currentChild.avatar || "https://placehold.co/100" }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <Text style={styles.name}>{currentChild.name}</Text>
                </View>

                {["birth_date", "height", "weight", "sleep_pattern"].map((field) => (
                    <Text key={field} style={styles.detail}>
                        {formatFieldName(field)}: {currentChild[field] || "-"}
                    </Text>
                ))}

                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => {
                        setEditFields(["birth_date", "height", "weight", "sleep_pattern"]);
                        setEditModalVisible(true);
                    }}
                >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={{ color: "#fff", marginLeft: 6 }}>Düzenle</Text>
                </TouchableOpacity>
            </View>

            {/* 💊 Sağlık Bilgileri Kartı */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>💊 Sağlık Bilgileri</Text>
                {["allergies", "vaccines", "illnesses"].map((field) => (
                    <Text key={field} style={styles.detail}>
                        {formatFieldName(field)}: {currentChild[field] || "-"}
                    </Text>
                ))}

                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => {
                        setEditFields(["allergies", "vaccines", "illnesses"]);
                        setEditModalVisible(true);
                    }}
                >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={{ color: "#fff", marginLeft: 6 }}>Düzenle</Text>
                </TouchableOpacity>
            </View>

            {/* 📊 Sağlık Özetim Kartı */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>📊 Sağlık Özetim</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="medical" size={24} color="#60a5fa" />
                        <Text style={styles.statNumber}>24</Text>
                        <Text style={styles.statLabel}>Toplam Kayıt</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="alert-circle" size={24} color="#f87171" />
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Acil Durum</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="trending-up" size={24} color="#34d399" />
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>İlaç Kaydı</Text>
                    </View>
                </View>
            </View>

            {/* Düzenleme Modal */}
            <Modal visible={editModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Bilgileri Düzenle</Text>

                        {editFields.map((field) => (
                            <View key={field} style={{ marginBottom: 12 }}>
                                <Text style={styles.label}>{formatFieldName(field)}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formValues[field] || ""}
                                    onChangeText={(val) =>
                                        setFormValues((prev: any) => ({
                                            ...prev,
                                            [field]: val,
                                        }))
                                    }
                                    placeholder={formatFieldName(field)}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        ))}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveEdit}
                            >
                                <Text style={styles.modalButtonText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#0f172a", padding: 12 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
    card: {
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#4f46e5",
        marginBottom: 12,
    },
    name: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 8 },
    detail: { fontSize: 14, color: "#c7d2fe", marginTop: 4 },
    sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4f46e5",
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: "flex-start",
    },
    statsGrid: { flexDirection: "row", justifyContent: "space-between" },
    statCard: {
        backgroundColor: "#374151",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 5,
    },
    statNumber: { color: "#fff", fontSize: 20, fontWeight: "bold", marginVertical: 5 },
    statLabel: { color: "#c7d2fe", fontSize: 12 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#1e293b",
        padding: 20,
        borderRadius: 15,
        width: "80%",
    },
    modalTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 20 },
    input: {
        backgroundColor: "#374151",
        color: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    label: { color: "#fff", marginBottom: 6, fontWeight: "600" },
    modalButtons: { flexDirection: "row", justifyContent: "space-between" },
    modalButton: {
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
        alignItems: "center",
    },
    cancelButton: { backgroundColor: "#6b7280" },
    saveButton: { backgroundColor: "#4f46e5" },
    modalButtonText: { color: "#fff", fontWeight: "bold" },
});
