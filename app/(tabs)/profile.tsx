import React, { useState, useCallback ,useEffect} from "react";
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

import { HEALTH_SUMMARY_PROMPT  } from "@/src/prompts";
import { analyzeText } from "@/src/api/gemini";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAvoidingView, Platform } from "react-native";

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
    const [healthSummary, setHealthSummary] = useState<string>("");
    const [loadingSummary, setLoadingSummary] = useState(true);

    const Chip = ({ label, selected, onPress, color }: any) => (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor: selected ? color : "#e5e7eb",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                margin: 4,
            }}
        >
            <Text style={{ color: selected ? "#fff" : "#111", fontSize: 14 }}>{label}</Text>
        </TouchableOpacity>
    );
    // ✅ Çocuğu yükle

    const loadChild = async () => {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        console.log("👤 Kullanıcı:", userData, userErr);

        const user = userData?.user;
        if (!user) {
            console.log("❌ Kullanıcı yok");
            return;
        }

        const { data: profile, error: profErr } = await supabase
            .from("profiles")
            .select("selected_child_id")
            .eq("id", user.id)
            .single();
        console.log("📋 Profil:", profile, profErr);

        if (!profile?.selected_child_id) {
            console.log("❌ Seçili child yok");
            return;
        }

        const { data: child, error: childErr } = await supabase
            .from("children")
            .select("*")
            .eq("id", profile.selected_child_id)
            .single();

        console.log("🍼 Child:", child, childErr);

        if (child) {
            setCurrentChild(child);
            setFormValues({
                ...child,
                allergies: child.allergies
                    ? child.allergies.split(",").map((s: string) => s.trim())
                    : [],
                illnesses: child.illnesses
                    ? child.illnesses.split(",").map((s: string) => s.trim())
                    : [],
                vaccines: child.vaccines
                    ? child.vaccines.split(",").map((s: string) => s.trim())
                    : [],
            });
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadChild();
        }, [])
    );
    useEffect(() => {
        (async () => {
            if (!currentChild) return;

            const CACHE_KEY = `health_summary_${currentChild.id}`;
            setLoadingSummary(true);

            // Cache varsa göster
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            if (cached) {
                setHealthSummary(cached);
                setLoadingSummary(false);
            }

            try {
                const prompt = HEALTH_SUMMARY_PROMPT(currentChild);
                const aiResult = await analyzeText(prompt);
                const clean = aiResult.replace(/```/g, "").trim();

                setHealthSummary(clean);
                await AsyncStorage.setItem(CACHE_KEY, clean);
            } catch (err) {
                console.error("❌ Health summary API hatası:", err);
            }

            setLoadingSummary(false);
        })();
    }, [currentChild]);
   
    const formatFieldName = (field: string) => {
        const map: { [key: string]: string } = {
            name: "İsim",
            birthdate: "Doğum Tarihi",
            height: "Boy",
            weight: "Kilo",
            sleep_pattern: "Uyku Düzeni",
            allergies: "Alerjiler",
            vaccines: "Aşılar",
            illnesses: "Hastalıklar",
        };
        return map[field] || field;
    };

    if (!currentChild) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }}>
                <Text style={commonStyles.emptyText}>Henüz çocuk eklenmedi</Text>
                <TouchableOpacity
                    style={[commonStyles.submitBtn, { marginTop: 20 }]}
                    onPress={() => router.push("/onboarding/add-child")}  // senin AddChildScreen yolun
                >
                    <Text style={commonStyles.submitText}>👶 Yeni Çocuk Ekle</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }


    // ✅ Resim seç
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (result.canceled || !currentChild) return;

            setTempImage(result.assets[0].uri);
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

            let avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

            await supabase.from("children").update({ avatar: avatarUrl }).eq("id", childId);

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
            const valuesToSave = {
                ...formValues,
                allergies: Array.isArray(formValues.allergies)
                    ? formValues.allergies.join(", ")
                    : formValues.allergies,
                illnesses: Array.isArray(formValues.illnesses)
                    ? formValues.illnesses.join(", ")
                    : formValues.illnesses,
                vaccines: Array.isArray(formValues.vaccines)
                    ? formValues.vaccines.join(", ")
                    : formValues.vaccines,
            };

            const { error } = await supabase
                .from("children")
                .update(valuesToSave)
                .eq("id", currentChild.id);

            if (error) throw error;

            setCurrentChild({ ...currentChild, ...valuesToSave });
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

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
                {/* 👤 Çocuk Bilgileri */}
                <View style={{ marginBottom: 20 }}>
                    <View style={{ alignItems: "center" }}>
                        <TouchableOpacity onPress={pickImage} disabled={loading}>
                            {currentChild.avatar ? (
                                <Image source={{ uri: currentChild.avatar }} style={commonStyles.avatar} />
                            ) : (
                                <View style={[commonStyles.avatar, commonStyles.placeholder]}>
                                    <Text style={{ color: "#555" }}>📷 Resim Ekle</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={commonStyles.name}>{currentChild.name}</Text>
                    </View>


                    {/* Başlık + Düzenle butonu */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={commonStyles.sectionTitle}>👶 Çocuk Bilgileri</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setEditFields(["birthdate", "height", "weight", "sleep_pattern"]);
                                setEditModalVisible(true);
                            }}
                            style={{ padding: 6 }}
                        >
                            <Ionicons name="create-outline" size={20} color="#5c4033" />
                        </TouchableOpacity>
                    </View>

                    {/* Bilgiler + çizgiler */}
                    <View style={{ marginTop: 8 }}>
                        <Text style={commonStyles.detail}>
                            Doğum Tarihi: {currentChild.birthdate || "-"}
                        </Text>
                        <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 6 }} />

                        <Text style={commonStyles.detail}>
                            Boy: {currentChild.height || "-"} cm
                        </Text>
                        <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 6 }} />

                        <Text style={commonStyles.detail}>
                            Kilo: {currentChild.weight || "-"} kg
                        </Text>
                        <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 6 }} />

                        <Text style={commonStyles.detail}>
                            Uyku Düzeni: {currentChild.sleep_pattern || "-"}
                        </Text>
                    </View>
                </View>

                {/* 💊 Sağlık Bilgileri */}
                <View style={{ marginBottom: 20 }}>
                    {/* Başlık + Düzenle butonu */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={commonStyles.sectionTitle}>💊 Sağlık Bilgileri</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setEditFields(["allergies", "vaccines", "illnesses"]);
                                setEditModalVisible(true);
                            }}
                            style={{ padding: 6 }}
                        >
                            <Ionicons name="create-outline" size={20} color="#5c4033" />
                        </TouchableOpacity>
                    </View>

                    {/* Bilgiler + çizgiler */}
                    <View style={{ marginTop: 8 }}>
                        <Text style={commonStyles.detail}>
                            Alerjiler: {currentChild.allergies || "-"}
                        </Text>
                        <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 6 }} />

                        <Text style={commonStyles.detail}>
                            Aşılar: {currentChild.vaccines || "-"}
                        </Text>
                        <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 6 }} />

                        <Text style={commonStyles.detail}>
                            Hastalıklar: {currentChild.illnesses || "-"}
                        </Text>
                    </View>
                </View>

                {/* 📊 Sağlık Özetim */}

                <View style={commonStyles.summaryCard}>
                    <Text style={commonStyles.summaryTitle}>📌 Genel Sağlık Özeti</Text>
                    {loadingSummary ? (
                        <Text style={commonStyles.detail}>⏳ Hesaplanıyor...</Text>
                    ) : healthSummary ? (
                        <Text style={commonStyles.summaryText}>{healthSummary}</Text>
                    ) : (
                        <Text style={commonStyles.emptyText}>Bilgi bulunamadı</Text>
                    )}
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={commonStyles.modalOverlay}>
                        <View style={[commonStyles.modalContent, { maxHeight: "85%" }]}>
                            <ScrollView
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={commonStyles.modalTitle}>Bilgileri Düzenle</Text>

                                {/* Alerjiler */}
                                {editFields.includes("allergies") && (
                                    <View style={commonStyles.card}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Ionicons
                                                name="medkit-outline"
                                                size={18}
                                                color="#5c4033"
                                                style={{ marginRight: 6 }}
                                            />
                                            <Text style={commonStyles.label}>Alerjiler</Text>
                                        </View>
                                        <ScrollView
                                            style={{ maxHeight: 200 }}
                                            contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
                                        >
                                            {ALLERGIES.map((item) => (
                                                <Chip
                                                    key={item}
                                                    label={item}
                                                    selected={(formValues.allergies || []).includes(item)}
                                                    onPress={() => {
                                                        setFormValues((prev: any) => {
                                                            const selected = prev.allergies || [];
                                                            return {
                                                                ...prev,
                                                                allergies: selected.includes(item)
                                                                    ? selected.filter((v: string) => v !== item)
                                                                    : [...selected, item],
                                                            };
                                                        });
                                                    }}
                                                    color="#60a5fa"
                                                />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {/* Hastalıklar */}
                                {editFields.includes("illnesses") && (
                                    <View style={commonStyles.card}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Ionicons
                                                name="bandage-outline"
                                                size={18}
                                                color="#5c4033"
                                                style={{ marginRight: 6 }}
                                            />
                                            <Text style={commonStyles.label}>Hastalıklar</Text>
                                        </View>
                                        <ScrollView
                                            style={{ maxHeight: 200 }}
                                            contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
                                        >
                                            {DISEASES.map((item) => (
                                                <Chip
                                                    key={item}
                                                    label={item}
                                                    selected={(formValues.illnesses || []).includes(item)}
                                                    onPress={() => {
                                                        setFormValues((prev: any) => {
                                                            const selected = prev.illnesses || [];
                                                            return {
                                                                ...prev,
                                                                illnesses: selected.includes(item)
                                                                    ? selected.filter((v: string) => v !== item)
                                                                    : [...selected, item],
                                                            };
                                                        });
                                                    }}
                                                    color="#34d399"
                                                />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {/* Aşılar */}
                                {editFields.includes("vaccines") && (
                                    <View style={commonStyles.card}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Ionicons
                                                name="eyedrop-outline"
                                                size={18}
                                                color="#5c4033"
                                                style={{ marginRight: 6 }}
                                            />
                                            <Text style={commonStyles.label}>Aşılar</Text>
                                        </View>
                                        <ScrollView
                                            style={{ maxHeight: 200 }}
                                            contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
                                        >
                                            {VACCINES.map((item) => (
                                                <Chip
                                                    key={item}
                                                    label={item}
                                                    selected={(formValues.vaccines || []).includes(item)}
                                                    onPress={() => {
                                                        setFormValues((prev: any) => {
                                                            const selected = prev.vaccines || [];
                                                            return {
                                                                ...prev,
                                                                vaccines: selected.includes(item)
                                                                    ? selected.filter((v: string) => v !== item)
                                                                    : [...selected, item],
                                                            };
                                                        });
                                                    }}
                                                    color="#f59e0b"
                                                />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Kaydet & İptal butonları */}
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
                </KeyboardAvoidingView>
            </Modal>

        </View>
    );
}
// Yaygın alerjiler
export const ALLERGIES = [
    "Polen",
    "Süt",
    "Fıstık",
    "Fındık",
    "Ceviz",
    "Yumurta",
    "Balık",
    "Kabuklu Deniz Ürünleri",
    "Soya",
    "Gluten (Buğday)",
    "Çilek",
    "Domates",
    "Kivi",
    "Arı Sokması",
    "Kedi Tüyü",
    "Köpek Tüyü",
    "Toz",
    "Küf",
    "Lateks",
    "İlaç (Antibiyotik, vb.)",
];

// Yaygın çocuk hastalıkları
export const DISEASES = [
    "Grip",
    "Soğuk Algınlığı",
    "Bronşit",
    "Zatürre",
    "Astım",
    "Alerjik Rinit",
    "Orta Kulak İltihabı",
    "Bademcik İltihabı",
    "Faranjit",
    "Kızamık",
    "Kızamıkçık",
    "Kabakulak",
    "Suçiçeği",
    "Boğmaca",
    "Difteri",
    "Tetanoz",
    "Polio (Çocuk Felci)",
    "El Ayak Ağız Hastalığı",
    "İshal (Gastroenterit)",
    "Bağırsak Parazitleri",
    "Ürtiker (Kurdeşen)",
    "Egzama",
    "Konjonktivit (Göz İltihabı)",
    "COVID-19",
];

// Türkiye’de yaygın yapılan aşılar
export const VACCINES = [
    "BCG (Verem)",
    "Hepatit B",
    "DaBT-İPA-Hib (Beşli Karma)",
    "KPA (Pnömokok)",
    "MMR (Kızamık, Kızamıkçık, Kabakulak)",
    "Suçiçeği",
    "Rotavirüs",
    "Hepatit A",
    "Polio (Çocuk Felci, OPV/IPV)",
    "Tetanoz",
    "Difteri",
    "Boğmaca",
    "Grip Aşısı (Influenza)",
    "HPV (Rahim Ağzı Kanseri)",
    "Meningokok (Menenjit)",
    "COVID-19",
];
