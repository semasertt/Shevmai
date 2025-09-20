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
import { router } from "expo-router";
import {commonStyles} from "app/styles/common";

export default function ProfileScreen() {
    const [currentChild, setCurrentChild] = useState<any>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFields, setEditFields] = useState<string[]>([]);
    const [formValues, setFormValues] = useState<any>({});

    useEffect(() => {
        const loadChild = async () => {
            // 🔑 Giriş yapan kullanıcıyı al
            const { data: userData } = await supabase.auth.getUser();
            const user = userData?.user;
            if (!user) return;

            // 🔑 Kullanıcının profilinden seçili çocuk ID'sini getir
            const { data: profile, error: pErr } = await supabase
                .from("profiles")
                .select("selected_child_id")
                .eq("id", user.id)
                .single();

            if (pErr || !profile?.selected_child_id) return;

            // 🔑 Seçili çocuğu getir
            const { data: child, error: cErr } = await supabase
                .from("children")
                .select("*")
                .eq("id", profile.selected_child_id)
                .single();

            if (!cErr && child) {
                setCurrentChild(child);
                setFormValues(child);
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
            birthdate: "Doğum Tarihi", // ✅ doğru kolon adı
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
            <View style={commonStyles.page}>
                <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
                    Yükleniyor...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={commonStyles.page}>
            {/* 📌 Header */}
            <View style={commonStyles.header}>
                <Text style={commonStyles.headerTitle}>Profil</Text>
                <TouchableOpacity onPress={() => router.push("/settings" as any)}>
                    <Ionicons name="settings-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* 👤 Çocuk Bilgileri Kartı */}
            <View style={commonStyles.card}>
                <View style={{ alignItems: "center" }}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{ uri: currentChild.avatar || "https://placehold.co/100" }}
                            style={commonStyles.avatar}
                        />
                    </TouchableOpacity>
                    <Text style={commonStyles.name}>{currentChild.name}</Text>
                </View>

                {["birthdate", "height", "weight", "sleep_pattern"].map((field) => (
                    <Text key={field} style={commonStyles.detail}>
                        {formatFieldName(field)}: {currentChild[field] || "-"}
                    </Text>
                ))}

                <TouchableOpacity
                    style={commonStyles.editBtn}
                    onPress={() => {
                        setEditFields(["birthdate", "height", "weight", "sleep_pattern"]);
                        setEditModalVisible(true);
                    }}
                >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={{ color: "#fff", marginLeft: 6 }}>Düzenle</Text>
                </TouchableOpacity>
            </View>

            {/* 💊 Sağlık Bilgileri Kartı */}
            <View style={commonStyles.card}>
                <Text style={commonStyles.sectionTitle}>💊 Sağlık Bilgileri</Text>
                {["allergies", "vaccines", "illnesses"].map((field) => (
                    <Text key={field} style={commonStyles.detail}>
                        {formatFieldName(field)}: {currentChild[field] || "-"}
                    </Text>
                ))}

                <TouchableOpacity
                    style={commonStyles.editBtn}
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
            <View style={commonStyles.card}>
                <Text style={commonStyles.sectionTitle}>📊 Sağlık Özetim</Text>
                <View style={commonStyles.statsGrid}>
                    <View style={commonStyles.statCard}>
                        <Ionicons name="medical" size={24} color="#60a5fa" />
                        <Text style={commonStyles.statNumber}>24</Text>
                        <Text style={commonStyles.statLabel}>Toplam Kayıt</Text>
                    </View>
                    <View style={commonStyles.statCard}>
                        <Ionicons name="alert-circle" size={24} color="#f87171" />
                        <Text style={commonStyles.statNumber}>3</Text>
                        <Text style={commonStyles.statLabel}>Acil Durum</Text>
                    </View>
                    <View style={commonStyles.statCard}>
                        <Ionicons name="trending-up" size={24} color="#34d399" />
                        <Text style={commonStyles.statNumber}>12</Text>
                        <Text style={commonStyles.statLabel}>İlaç Kaydı</Text>
                    </View>
                </View>
            </View>

            {/* Düzenleme Modal */}
            <Modal visible={editModalVisible} transparent animationType="slide">
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        <Text style={commonStyles.modalTitle}>Bilgileri Düzenle</Text>

                        {editFields.map((field) => (
                            <View key={field} style={{ marginBottom: 12 }}>
                                <Text style={commonStyles.label}>{formatFieldName(field)}</Text>
                                <TextInput
                                    style={commonStyles.input}
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

                        <View style={commonStyles.modalButtons}>
                            <TouchableOpacity
                                style={[commonStyles.modalButton, commonStyles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={commonStyles.modalButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[commonStyles.modalButton, commonStyles.saveButton]}
                                onPress={saveEdit}
                            >
                                <Text style={commonStyles.modalButtonText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

