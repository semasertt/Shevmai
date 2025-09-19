import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    ScrollView,
    StyleSheet,
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // ✅ Çocuk bilgileri
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

    const onSignUp = async () => {
        if (!username.trim() || !email.trim() || !password.trim()) {
            return Alert.alert("Uyarı", "Kullanıcı adı, e-posta ve şifre zorunludur.");
        }
        if (!childName.trim()) {
            return Alert.alert("Uyarı", "Çocuğun adı gerekli.");
        }

        const { error: sErr } = await supabase.auth.signUp({ email, password });
        if (sErr) return Alert.alert("Kayıt Hatası", sErr.message);

        const { error: iErr } = await supabase.auth.signInWithPassword({ email, password });
        if (iErr) return Alert.alert("Giriş Hatası", iErr.message);

        const { data: u } = await supabase.auth.getUser();
        if (!u?.user) return Alert.alert("Hata", "Kullanıcı bilgisi alınamadı.");

        const { error: pErr } = await supabase
            .from("profiles")
            .upsert({ id: u.user.id, username, email }, { onConflict: "id" });
        if (pErr) return Alert.alert("Kayıt Hatası", pErr.message);

        const { data: childData, error: cErr } = await supabase
            .from("children")
            .insert({
                name: childName,
                birth_date: birthDate ? birthDate.toISOString().split("T")[0] : null,
                gender: gender,
                height: height.toString(),
                weight: weight.toString(),
                sleep_pattern: sleepPattern,
                allergies: allergies,
                vaccines: vaccines,
                illnesses: illnesses,
            })
            .select()
            .single();

        if (cErr) return Alert.alert("Çocuk Kaydı Hatası", cErr.message);

        await supabase
            .from("profiles")
            .update({ selected_child_id: childData.id })
            .eq("id", u.user.id);

        Alert.alert("Başarılı", "Hesap ve çocuk bilgileri oluşturuldu.");
        router.replace("/home");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.page}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
                    <Text style={styles.title}>Kayıt Ol</Text>

                    {/* Kullanıcı bilgileri */}
                    <View style={styles.card}>
                        <TextInput
                            placeholder="Kullanıcı adı"
                            value={username}
                            onChangeText={setUsername}
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />
                        <TextInput
                            placeholder="E-posta"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />
                        <TextInput
                            placeholder="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Çocuk Bilgileri</Text>

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
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                            <Text style={{ color: birthDate ? "#111827" : "#6b7280" }}>
                                {birthDate ? birthDate.toLocaleDateString("tr-TR") : "Tarih Seçin"}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={birthDate || new Date()}
                                mode="date"
                                display="calendar"
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
                                style={[styles.input, { flex: 1, marginHorizontal: 8, textAlign: "center" }]}
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
                                style={[styles.input, { flex: 1, marginHorizontal: 8, textAlign: "center" }]}
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
                            {["0-3 saat", "3-6 saat", "6-9 saat", "9-12 saat"].map((option) => (
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
                            ))}
                        </View>
                    </View>

                    {/* Diğer Alanlar */}
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

                    <TouchableOpacity onPress={onSignUp} style={styles.submitBtn}>
                        <Text style={styles.submitText}>Kayıt Ol</Text>
                    </TouchableOpacity>

                    <Text style={{ textAlign: "center", color: "#fff" }}>
                        Zaten hesabın var mı? <Link href="/(auth)/sign-in">Giriş yap</Link>
                    </Text>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: "#0f172a",
        padding: 20,
    },
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
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        color: "#fff",
    },
    label: {
        marginBottom: 8,
        fontWeight: "bold",
        color: "#111827",
    },
    counterRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    counterBtn: {
        backgroundColor: "#2563eb",
        padding: 10,
        borderRadius: 8,
    },
    counterText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    counterValue: {
        marginHorizontal: 12,
        fontSize: 18,
        color: "#111827",
    },
    submitBtn: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    submitText: {
        textAlign: "center",
        fontWeight: "800",
        color: "#fff",
    },
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
    genderBtnSelected: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
    },
    genderBtnText: {
        fontWeight: "600",
        color: "#111827",
    },
    genderBtnTextSelected: {
        color: "#fff",
    },
});
