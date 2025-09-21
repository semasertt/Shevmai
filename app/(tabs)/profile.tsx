import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const { commonStyles, theme, isDark } = useTheme();
    const [currentChild, setCurrentChild] = useState<any>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFields, setEditFields] = useState<string[]>([]);
    const [formValues, setFormValues] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // ✅ Resim için yeni state
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);

    const loadChild = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        const { data: profile } = await supabase
            .from("profiles")
            .select("selected_child_id")
            .eq("id", user.id)
            .single();

        if (!profile?.selected_child_id) return;

        const { data: child } = await supabase
            .from("children")
            .select("*")
            .eq("id", profile.selected_child_id)
            .single();

        if (child) {
            setCurrentChild(child);
            setFormValues(child);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadChild();
        }, [])
    );

    const formatFieldName = (field: string) => {
        const fieldNames: { [key: string]: string } = {
            name: "İsim",
            birthdate: "Doğum Tarihi",
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
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.background}}>
                <Text style={commonStyles.emptyText}>Yükleniyor...</Text>
            </SafeAreaView>
        );
    }

    // ✅ Resim seç
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled || !currentChild) return;

            const file = result.assets[0];
            setTempImage(file.uri);
            setPreviewVisible(true);
        } catch (error) {
            Alert.alert("Hata", "Resim seçilirken hata oluştu");
            console.error(error);
        }
    };

    // ✅ Resim kaydet
    const saveImage = async () => {
        if (!tempImage || !currentChild) return;
        try {
            setLoading(true);

            const childId = currentChild.id;
            const filePath = `avatars/${childId}.jpg`;

            const file = await FileSystem.readAsStringAsync(tempImage, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const fileData = decode(file);

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, fileData, {
                    contentType: "image/jpeg",
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            let avatarUrl = publicUrlData.publicUrl;
            avatarUrl = `${avatarUrl}?t=${Date.now()}`;

            await supabase
                .from("children")
                .update({ avatar: avatarUrl })
                .eq("id", childId);

            setCurrentChild({ ...currentChild, avatar: avatarUrl });
            setFormValues((prev: any) => ({ ...prev, avatar: avatarUrl }));
            setPreviewVisible(false);
            setTempImage(null);

            Alert.alert("Başarılı", "Profil resmi kaydedildi ✅");
        } catch (error) {
            Alert.alert("Hata", "Resim yüklenirken hata oluştu");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Bilgi kaydet
    const saveEdit = async () => {
        try {
            const { error } = await supabase
                .from("children")
                .update(formValues)
                .eq("id", currentChild.id);

            if (error) throw error;

            setCurrentChild({ ...currentChild, ...formValues });
            setEditModalVisible(false);
            Alert.alert("Başarılı", "Bilgiler güncellendi ✅");
        } catch (error) {
            Alert.alert("Hata", "Bilgiler güncellenirken hata oluştu");
            console.error(error);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* 📌 Header */}
            <View style={commonStyles.header}>
                <Text style={commonStyles.headerTitle}>Profil</Text>
                <TouchableOpacity onPress={() => router.push("/settings" as any)}>
                    <Ionicons name="settings-outline" size={22} color="#5c4033" />
                </TouchableOpacity>
            </View>

            {/* 📌 İçerik */}
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
                {/* 👤 Çocuk Bilgileri */}

                <View style={{ marginBottom: 20 }}>
                    <View style={{ alignItems: "center" }}>
                        <TouchableOpacity onPress={pickImage} disabled={loading}>
                            {currentChild.avatar ? (
                                <Image
                                    source={{ uri: currentChild.avatar }}
                                    style={commonStyles.avatar}
                                />
                            ) : (
                                <View
                                    style={[commonStyles.avatar, commonStyles.placeholder]}
                                >
                                    <Text style={{ color: "#555" }}>📷 Resim Ekle</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={commonStyles.name}>{currentChild.name}</Text>
                    </View>
                    <Text style={commonStyles.sectionTitle}>👶 Çocuk Bilgileri</Text>


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
                        <Text style={commonStyles.editBtnText}>Düzenle</Text>
                    </TouchableOpacity>
                </View>

                {/* 💊 Sağlık Bilgileri */}
                <View style={{ marginBottom: 20 }}>
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
                        <Text style={commonStyles.editBtnText}>Düzenle</Text>
                    </TouchableOpacity>
                </View>

                {/* 📊 Sağlık Özetim */}
                <View style={{ marginBottom: 20 }}>
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
            </ScrollView>

            {/* ✅ Resim Önizleme Modal */}
            <Modal visible={previewVisible} transparent animationType="fade">
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        {tempImage && (
                            <Image
                                source={{ uri: tempImage }}
                                style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 100,
                                    alignSelf: "center",
                                    marginBottom: 20,
                                }}
                            />
                        )}

                        <View style={commonStyles.modalButtons}>
                            <TouchableOpacity
                                style={[commonStyles.modalButton, commonStyles.cancelButton]}
                                onPress={() => {
                                    setPreviewVisible(false);
                                    setTempImage(null);
                                }}
                            >
                                <Text style={commonStyles.modalButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[commonStyles.modalButton, commonStyles.saveButton]}
                                onPress={saveImage}
                                disabled={loading}
                            >
                                <Text style={commonStyles.modalButtonText}>
                                    {loading ? "Kaydediliyor..." : "Kaydet"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ✅ Bilgi Düzenleme Modal */}
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
        </View>
    );
}
