import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

export default function AddChildScreen() {
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

        const { error } = await supabase.from("children").insert({
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
        });

        if (error) {
            Alert.alert("Hata", error.message);
        } else {
            Alert.alert("Başarılı", "Çocuk eklendi");
            router.replace("/choose-child");
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#0f172a" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={80} // header varsa değerle oynayabilirsin
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Yeni Çocuk Ekle</Text>

                    {/* Adı */}
                    <View style={styles.card}>
                        <TextInput
                            placeholder="Adı"
                            value={childName}
                            onChangeText={setChildName}
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />

                        {/* Doğum Tarihi */}
                        <Text style={styles.label}>Doğum Tarihi</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={styles.input}
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

                    {/* Cinsiyet */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Cinsiyet</Text>
                        <View style={{ flexDirection: "row", marginBottom: 4 }}>
                            {["Erkek", "Kız"].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setGender(option)}
                                    style={[
                                        styles.genderBtn,
                                        gender === option && styles.genderBtnSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.genderBtnText,
                                            gender === option && styles.genderBtnTextSelected,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Boy */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Boy (cm)</Text>
                        <View style={styles.counterRow}>
                            <TouchableOpacity
                                onPress={() => setHeight((prev) => Math.max(30, prev - 1))}
                                style={styles.counterBtn}
                            >
                                <Text style={styles.counterText}>-</Text>
                            </TouchableOpacity>

                            <TextInput
                                value={height.toString()}
                                onChangeText={(val) => {
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num)) setHeight(num);
                                }}
                                keyboardType="numeric"
                                style={[
                                    styles.input,
                                    { flex: 1, marginHorizontal: 8, textAlign: "center" },
                                ]}
                                placeholder="Boy"
                                placeholderTextColor="#6b7280"
                            />

                            <TouchableOpacity
                                onPress={() => setHeight((prev) => Math.min(250, prev + 1))}
                                style={styles.counterBtn}
                            >
                                <Text style={styles.counterText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Kilo */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Kilo (kg)</Text>
                        <View style={styles.counterRow}>
                            <TouchableOpacity
                                onPress={() => setWeight((prev) => Math.max(1, prev - 1))}
                                style={styles.counterBtn}
                            >
                                <Text style={styles.counterText}>-</Text>
                            </TouchableOpacity>

                            <TextInput
                                value={weight.toString()}
                                onChangeText={(val) => {
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num)) setWeight(num);
                                }}
                                keyboardType="numeric"
                                style={[
                                    styles.input,
                                    { flex: 1, marginHorizontal: 8, textAlign: "center" },
                                ]}
                                placeholder="Kilo"
                                placeholderTextColor="#6b7280"
                            />

                            <TouchableOpacity
                                onPress={() => setWeight((prev) => Math.min(200, prev + 1))}
                                style={styles.counterBtn}
                            >
                                <Text style={styles.counterText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Uyku Düzeni */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Uyku Düzeni</Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            {["0-3 saat", "3-6 saat", "6-9 saat", "9-12 saat"].map(
                                (option) => (
                                    <TouchableOpacity
                                        key={option}
                                        onPress={() => setSleepPattern(option)}
                                        style={[
                                            styles.genderBtn,
                                            sleepPattern === option && styles.genderBtnSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.genderBtnText,
                                                sleepPattern === option && styles.genderBtnTextSelected,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>

                    {/* Alerjiler, Aşılar, Hastalıklar */}
                    <View style={styles.card}>
                        <TextInput
                            placeholder="Alerjiler (ör. Fıstık, Polen)"
                            value={allergies}
                            onChangeText={setAllergies}
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />
                        <TextInput
                            placeholder="Aşılar (ör. Kızamık, Tetanoz)"
                            value={vaccines}
                            onChangeText={setVaccines}
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />
                        <TextInput
                            placeholder="Geçirdiği Hastalıklar (ör. Suçiçeği, Grip)"
                            value={illnesses}
                            onChangeText={setIllnesses}
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    {/* Kaydet Butonu */}
                    <TouchableOpacity onPress={addChild} style={styles.submitBtn}>
                        <Text style={styles.submitText}>Kaydet</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 26,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 16,
        color: "#fff",
    },
    card: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#fff",
        color: "#111827",
    },
    label: { marginBottom: 8, fontWeight: "bold", color: "#111827" },
    counterRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    counterBtn: {
        backgroundColor: "#2563eb",
        padding: 10,
        borderRadius: 8,
    },
    counterText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    submitBtn: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    submitText: { textAlign: "center", fontWeight: "800", color: "#fff" },
    genderBtn: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: "#fff",
    },
    genderBtnSelected: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
    genderBtnText: { fontWeight: "600", color: "#111827" },
    genderBtnTextSelected: { color: "#fff" },
});
