import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { setSelectedChild } from "@/services/children";

export default function AddChildScreen() {
    const { commonStyles, isDark, theme } = useTheme();

    const [childName, setChildName] = useState("");
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState("");
    const [height, setHeight] = useState(100);
    const [weight, setWeight] = useState(10);
    const [sleepPattern, setSleepPattern] = useState("");
    const [allergies, setAllergies] = useState("");
    const [vaccines, setVaccines] = useState("");
    const [illnesses, setIllnesses] = useState("");

    const addChild = async () => {
        if (!childName.trim()) {
            return Alert.alert("Uyarı", "Çocuğun adı gerekli.");
        }

        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
            Alert.alert("Hata", "Kullanıcı bulunamadı");
            return;
        }

        const { data, error } = await supabase
            .from("children")
            .insert({
                parent_id: user.id,
                name: childName,
                birthdate: birthDate ? birthDate.toISOString().split("T")[0] : null,
                gender,
                height: height.toString(),
                weight: weight.toString(),
                sleep_pattern: sleepPattern,
                allergies,
                vaccines,
                illnesses,
            })
            .select()
            .single();

        if (error) {
            Alert.alert("Hata", error.message);
        } else {
            await supabase
                .from("profiles")
                .update({ selected_child_id: data.id })
                .eq("id", user.id);
            // ✅ Local’i güncelle
            if(data.id){
                await setSelectedChild(data.id);

            }
            Alert.alert("Başarılı", "Çocuk eklendi ve seçildi");
            router.replace("/(tabs)/home");
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <View style={{ flex: 1, backgroundColor: theme.background }}>
                {/* ✅ StatusBar */}
                <StatusBar
                    backgroundColor={theme.headerBg}
                    barStyle={isDark ? "light-content" : "dark-content"}
                />

                {/* ✅ Navbar */}
                <View style={commonStyles.header}>
                    <TouchableOpacity onPress={() => router.replace("/settings")} style={commonStyles.headerIconLeft}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={commonStyles.headerTitle}>👶 Yeni Çocuk Ekle</Text>
                    <View style={commonStyles.headerIconRight} />
                </View>

                {/* ✅ Scrollable Content */}
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                >
                    <Text style={commonStyles.title}>Yeni Çocuk Ekle</Text>

                    {/* 🔻 Adı + Doğum Tarihi */}
                    <View style={commonStyles.card}>
                        <TextInput
                            placeholder="Adı"
                            value={childName}
                            onChangeText={setChildName}
                            style={commonStyles.input}
                            placeholderTextColor="#6b7280"
                        />

                        <Text style={commonStyles.label}>Doğum Tarihi</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={commonStyles.input}
                        >
                            <Text style={{ color: birthDate ? "#111827" : "#6b7280" }}>
                                {birthDate
                                    ? birthDate.toLocaleDateString("tr-TR")
                                    : "Tarih Seçin"}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={birthDate || new Date()}
                                mode="date"
                                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setBirthDate(selectedDate);
                                }}
                            />
                        )}
                    </View>

                    {/* 🔻 Cinsiyet */}
                    <View style={commonStyles.card}>
                        <Text style={commonStyles.label}>Cinsiyet</Text>
                        <View style={{ flexDirection: "row", marginBottom: 4 }}>
                            {["Erkek", "Kız"].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setGender(option)}
                                    style={[
                                        commonStyles.genderBtn,
                                        gender === option && commonStyles.genderBtnSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            commonStyles.genderBtnText,
                                            gender === option && commonStyles.genderBtnTextSelected,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 🔻 Boy */}
                    <View style={commonStyles.card}>
                        <Text style={commonStyles.label}>Boy (cm)</Text>
                        <View style={commonStyles.counterRow}>
                            <TouchableOpacity
                                onPress={() => setHeight((prev) => Math.max(30, prev - 1))}
                                style={commonStyles.counterBtn}
                            >
                                <Text style={commonStyles.counterText}>-</Text>
                            </TouchableOpacity>

                            <TextInput
                                value={height.toString()}
                                onChangeText={(val) => {
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num)) setHeight(num);
                                }}
                                keyboardType="numeric"
                                style={[
                                    commonStyles.input,
                                    { flex: 1, marginHorizontal: 8, textAlign: "center" },
                                ]}
                                placeholder="Boy"
                                placeholderTextColor="#6b7280"
                            />

                            <TouchableOpacity
                                onPress={() => setHeight((prev) => Math.min(250, prev + 1))}
                                style={commonStyles.counterBtn}
                            >
                                <Text style={commonStyles.counterText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 🔻 Kilo */}
                    <View style={commonStyles.card}>
                        <Text style={commonStyles.label}>Kilo (kg)</Text>
                        <View style={commonStyles.counterRow}>
                            <TouchableOpacity
                                onPress={() => setWeight((prev) => Math.max(1, prev - 1))}
                                style={commonStyles.counterBtn}
                            >
                                <Text style={commonStyles.counterText}>-</Text>
                            </TouchableOpacity>

                            <TextInput
                                value={weight.toString()}
                                onChangeText={(val) => {
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num)) setWeight(num);
                                }}
                                keyboardType="numeric"
                                style={[
                                    commonStyles.input,
                                    { flex: 1, marginHorizontal: 8, textAlign: "center" },
                                ]}
                                placeholder="Kilo"
                                placeholderTextColor="#6b7280"
                            />

                            <TouchableOpacity
                                onPress={() => setWeight((prev) => Math.min(200, prev + 1))}
                                style={commonStyles.counterBtn}
                            >
                                <Text style={commonStyles.counterText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 🔻 Uyku Düzeni */}
                    <View style={commonStyles.card}>
                        <Text style={commonStyles.label}>Uyku Düzeni</Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            {["0-3 saat", "3-6 saat", "6-9 saat", "9-12 saat"].map(
                                (option) => (
                                    <TouchableOpacity
                                        key={option}
                                        onPress={() => setSleepPattern(option)}
                                        style={[
                                            commonStyles.genderBtn,
                                            sleepPattern === option &&
                                            commonStyles.genderBtnSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                commonStyles.genderBtnText,
                                                sleepPattern === option &&
                                                commonStyles.genderBtnTextSelected,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>

                    {/* 🔻 Alerjiler, Aşılar, Hastalıklar */}
                    <View style={commonStyles.card}>
                        <TextInput
                            placeholder="Alerjiler (ör. Fıstık, Polen)"
                            value={allergies}
                            onChangeText={setAllergies}
                            style={commonStyles.input}
                            placeholderTextColor="#6b7280"
                        />
                        <TextInput
                            placeholder="Aşılar (ör. Kızamık, Tetanoz)"
                            value={vaccines}
                            onChangeText={setVaccines}
                            style={commonStyles.input}
                            placeholderTextColor="#6b7280"
                        />
                        <TextInput
                            placeholder="Geçirdiği Hastalıklar (ör. Suçiçeği, Grip)"
                            value={illnesses}
                            onChangeText={setIllnesses}
                            style={commonStyles.input}
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    {/* 🔻 Kaydet Butonu */}
                    <TouchableOpacity onPress={addChild} style={commonStyles.submitBtn}>
                        <Text style={commonStyles.submitText}>Kaydet</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
