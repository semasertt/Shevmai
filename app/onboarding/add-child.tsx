import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

export default function AddChild() {
    const [name, setName] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [gender, setGender] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [sleepPattern, setSleepPattern] = useState("");
    const [allergies, setAllergies] = useState("");
    const [vaccines, setVaccines] = useState("");
    const [illnesses, setIllnesses] = useState("");

    const onSave = async () => {
        if (!name.trim()) return Alert.alert("Uyarı", "İsim zorunlu");

        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return Alert.alert("Hata", "Giriş yapılmamış");

        const { error } = await supabase.from("children").insert({
            name,
            birthdate: birthdate || null,
            gender: gender || null,
            height: height || null,
            weight: weight || null,
            sleep_pattern: sleepPattern || null,
            allergies: allergies || null,
            vaccines: vaccines || null,
            illnesses: illnesses || null,
            owner_user_id: user.user.id,
        });

        if (error) return Alert.alert("Hata", error.message);

        Alert.alert("Başarılı", "Çocuk eklendi.");
        router.replace("/choose-child");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.page}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView>
                    <Text style={styles.title}>Yeni Çocuk Ekle</Text>

                    <View style={styles.card}>
                        <TextInput
                            placeholder="İsim *"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Doğum Tarihi (YYYY-MM-DD)"
                            value={birthdate}
                            onChangeText={setBirthdate}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Cinsiyet"
                            value={gender}
                            onChangeText={setGender}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Boy (cm)"
                            value={height}
                            onChangeText={setHeight}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Kilo (kg)"
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Uyku Düzeni"
                            value={sleepPattern}
                            onChangeText={setSleepPattern}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Alerjiler"
                            value={allergies}
                            onChangeText={setAllergies}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Aşılar"
                            value={vaccines}
                            onChangeText={setVaccines}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Hastalıklar"
                            value={illnesses}
                            onChangeText={setIllnesses}
                            style={styles.input}
                        />
                    </View>

                    <TouchableOpacity onPress={onSave} style={styles.submitBtn}>
                        <Text style={styles.submitText}>Kaydet</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
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
    },
    submitBtn: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 12,
        marginTop: 12,
    },
    submitText: { textAlign: "center", fontWeight: "800", color: "#fff" },
});
