import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Pressable,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    Switch,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';

const MOCK_CHILDREN = [
    {
        id: "c1",
        name: "Ela",
        birth: "2021-05-10",
        height: "105 cm",
        weight: "18 kg",
        avatar: "https://avatars.dicebear.com/api/avataaars/ela.png",
    },
    {
        id: "c2",
        name: "Mert",
        birth: "2023-02-01",
        height: "85 cm",
        weight: "12 kg",
        avatar: "https://avatars.dicebear.com/api/avataaars/mert.png",
    },
];

const THEME_COLORS = [
    { id: 'blue', name: 'Mavi', color: '#3b82f6' },
    { id: 'green', name: 'Yeşil', color: '#10b981' },
    { id: 'purple', name: 'Mor', color: '#8b5cf6' },
    { id: 'pink', name: 'Pembe', color: '#ec4899' },
    { id: 'orange', name: 'Turuncu', color: '#f97316' },
];

export default function ProfileScreen() {
    const [currentChild, setCurrentChild] = useState(MOCK_CHILDREN[0]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState("");
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [selectedTheme, setSelectedTheme] = useState('blue');
    const [showThemePicker, setShowThemePicker] = useState(false);
    const [showHealthModal, setShowHealthModal] = useState(false);
    const navigation = useNavigation();

    // Profil resmi değiştirme
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setCurrentChild(prev => ({
                    ...prev,
                    avatar: result.assets[0].uri
                }));
                Alert.alert("Başarılı", "Profil resmi değiştirildi");
            }
        } catch (error) {
            Alert.alert("Hata", "Resim yüklenirken bir hata oluştu");
        }
    };

    // Tema rengi değiştirme
    const changeTheme = (themeId: string) => {
        setSelectedTheme(themeId);
        setShowThemePicker(false);
        Alert.alert("Tema Değiştirildi", `Tema rengi ${THEME_COLORS.find(t => t.id === themeId)?.name} olarak ayarlandı`);
    };

    const handleEditField = (field: string, currentValue: string) => {
        setEditingField(field);
        setTempValue(currentValue);
        setEditModalVisible(true);
    };

    const saveEdit = () => {
        if (editingField && tempValue.trim()) {
            setCurrentChild(prev => ({
                ...prev,
                [editingField]: tempValue
            }));
        }
        setEditModalVisible(false);
        setEditingField(null);
        setTempValue("");
    };

    const formatFieldName = (field: string) => {
        const fieldNames: { [key: string]: string } = {
            birth: "Doğum Tarihi",
            height: "Boy",
            weight: "Kilo",
            name: "İsim"
        };
        return fieldNames[field] || field;
    };

    // Sağlık bilgileri modal
    const HealthInfoModal = () => (
        <Modal
            visible={showHealthModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowHealthModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>💊 Sağlık Bilgileri</Text>

                    <View style={styles.healthInfo}>
                        <Text style={styles.healthLabel}>Kan Grubu:</Text>
                        <Text style={styles.healthValue}>A Rh+</Text>

                        <Text style={styles.healthLabel}>Alerjiler:</Text>
                        <Text style={styles.healthValue}>Polen, Toz</Text>

                        <Text style={styles.healthLabel}>Kronik Hastalıklar:</Text>
                        <Text style={styles.healthValue}>Yok</Text>

                        <Text style={styles.healthLabel}>Aşı Takvimi:</Text>
                        <Text style={styles.healthValue}>Güncel</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.modalButton, styles.saveButton]}
                        onPress={() => setShowHealthModal(false)}
                    >
                        <Text style={styles.modalButtonText}>Tamam</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Tema seçici modal
    const ThemePickerModal = () => (
        <Modal
            visible={showThemePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowThemePicker(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>🎨 Tema Rengi Seç</Text>

                    <View style={styles.themeGrid}>
                        {THEME_COLORS.map(theme => (
                            <TouchableOpacity
                                key={theme.id}
                                style={[
                                    styles.themeOption,
                                    { backgroundColor: theme.color },
                                    selectedTheme === theme.id && styles.themeSelected
                                ]}
                                onPress={() => changeTheme(theme.id)}
                            >
                                <Text style={styles.themeText}>{theme.name}</Text>
                                {selectedTheme === theme.id && (
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setShowThemePicker(false)}
                    >
                        <Text style={styles.modalButtonText}>İptal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Ayarlar Dropdown içeriği
    const SettingsDropdown = () => (
        <View style={styles.dropdownRight}>
            {/* Tema Rengi */}
            <Pressable
                style={styles.dropItem}
                onPress={() => {
                    setSettingsOpen(false);
                    setShowThemePicker(true);
                }}
            >
                <Ionicons name="color-palette-outline" size={20} color="#fff" />
                <Text style={styles.dropText}>Tema Rengi</Text>
            </Pressable>

            {/* Bildirimler */}
            <View style={styles.dropItem}>
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                <Text style={styles.dropText}>Bildirimler</Text>
                <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    style={{ marginLeft: 'auto' }}
                />
            </View>

            {/* Sağlık Bilgileri */}
            <Pressable
                style={styles.dropItem}
                onPress={() => {
                    setSettingsOpen(false);
                    setShowHealthModal(true);
                }}
            >
                <Ionicons name="medkit-outline" size={20} color="#fff" />
                <Text style={styles.dropText}>Sağlık Bilgileri</Text>
            </Pressable>

            <Pressable style={styles.dropItem}>
                <Ionicons name="language-outline" size={20} color="#fff" />
                <Text style={styles.dropText}>Dil Seçimi</Text>
            </Pressable>

            <Pressable style={styles.dropItem}>
                <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                <Text style={styles.dropText}>Gizlilik</Text>
            </Pressable>

            <Pressable style={styles.dropItem}>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.dropText}>Çıkış Yap</Text>
            </Pressable>
        </View>
    );

    return (
        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* üst kısım: resim + bilgiler */}
            <View style={styles.topRow}>
                {/* avatar - TIKLANABİLİR */}
                <View style={{ alignItems: "center" }}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image source={{ uri: currentChild.avatar }} style={styles.avatar} />
                        <View style={styles.editAvatarOverlay}>
                            <Ionicons name="camera" size={24} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* çocuk değiştir */}
                    <TouchableOpacity
                        style={styles.changeChildBtn}
                        onPress={() => navigation.navigate("choose-child" as never)}
                    >
                        <Ionicons name="swap-horizontal" size={18} color="#fff" />
                        <Text style={styles.changeChildText}>Çocuğu Değiştir</Text>
                    </TouchableOpacity>
                </View>

                {/* bilgiler */}
                <View style={styles.infoBox}>
                    <TouchableOpacity onPress={() => handleEditField('name', currentChild.name)}>
                        <Text style={styles.name}>{currentChild.name} ✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleEditField('birth', currentChild.birth)}>
                        <Text style={styles.detail}>Doğum Tarihi: {currentChild.birth} ✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleEditField('height', currentChild.height)}>
                        <Text style={styles.detail}>Boy: {currentChild.height} ✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleEditField('weight', currentChild.weight)}>
                        <Text style={styles.detail}>Kilo: {currentChild.weight} ✏️</Text>
                    </TouchableOpacity>
                </View>

                {/* ayarlar butonu */}
                <Pressable
                    style={styles.settingsBtn}
                    onPress={() => setSettingsOpen(!settingsOpen)}
                >
                    <Ionicons name="settings-outline" size={26} color="#fff" />
                </Pressable>
            </View>

            {/* Düzenleme Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {formatFieldName(editingField || '')} Düzenle
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={tempValue}
                            onChangeText={setTempValue}
                            placeholder={`Yeni ${formatFieldName(editingField || '')}`}
                            placeholderTextColor="#999"
                        />

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

            {/* İstatistikler Bölümü */}
            <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>İstatistikler</Text>

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

            {/* Modal'lar */}
            <HealthInfoModal />
            <ThemePickerModal />

            {/* Ayarlar Dropdown */}
            {settingsOpen && <SettingsDropdown />}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#0f172a" },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        position: "relative",
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#4f46e5",
    },
    editAvatarOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4f46e5',
        borderRadius: 20,
        padding: 6,
    },
    infoBox: { marginLeft: 16, flex: 1 },
    name: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 8 },
    detail: { fontSize: 14, color: "#c7d2fe", marginTop: 4, paddingVertical: 2 },
    settingsBtn: { position: "absolute", top: 20, right: 20 },
    dropdownRight: {
        position: "absolute",
        top: 60,
        right: 20,
        backgroundColor: "#1e3a8a",
        borderRadius: 12,
        overflow: "hidden",
        elevation: 6,
        width: 200,
        zIndex: 1000,
    },
    dropItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#312e81",
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropText: { color: "#fff", fontSize: 14, marginLeft: 10 },
    changeChildBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4f46e5",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginTop: 8,
    },
    changeChildText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1e293b',
        padding: 20,
        borderRadius: 15,
        width: '80%',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#374151',
        color: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6b7280',
    },
    saveButton: {
        backgroundColor: '#4f46e5',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statsSection: {
        padding: 20,
        backgroundColor: '#1e293b',
        margin: 16,
        borderRadius: 15,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#374151',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    statNumber: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    statLabel: {
        color: '#c7d2fe',
        fontSize: 12,
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    themeOption: {
        width: 100,
        height: 100,
        borderRadius: 10,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeSelected: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    themeText: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    healthInfo: {
        marginBottom: 20,
    },
    healthLabel: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 10,
    },
    healthValue: {
        color: '#c7d2fe',
        marginBottom: 5,
    },
});