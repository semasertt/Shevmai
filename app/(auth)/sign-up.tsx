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
    StatusBar,
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ALLERGIES, DISEASES, VACCINES } from "@/app/(tabs)/profile";


export default function SignUp() {
    const { commonStyles, isDark, theme } = useTheme();
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
    const [allergies, setAllergies] = useState<string[]>([]);
    const [vaccines, setVaccines] = useState<string[]>([]);
    const [illnesses, setIllnesses] = useState<string[]>([]);

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

    const onSignUp = async () => {
        if (!username.trim() || !email.trim() || !password.trim()) {
            return Alert.alert("Uyarı", "Kullanıcı adı, e-posta ve şifre zorunludur.");
        }
        if (!childName.trim()) {
            return Alert.alert("Uyarı", "Çocuğun adı gerekli.");
        }

        // 🔎 Username kontrolü
        const { data: existingUser, error: checkErr } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle();

        if (checkErr) return Alert.alert("Hata", "Kullanıcı adı kontrolü başarısız.");
        if (existingUser) return Alert.alert("Hata", "Bu kullanıcı adı zaten alınmış.");

        // 📝 Yeni kullanıcı oluştur
        const { data: signUpData, error: sErr } = await supabase.auth.signUp({
            email,
            password,
        });
        if (sErr) return Alert.alert("Kayıt Hatası", sErr.message);

        const user = signUpData?.user;
        if (!user) return Alert.alert("Hata", "Kullanıcı oluşturulamadı.");

        // 📌 Profil kaydı
        const { error: pErr } = await supabase
            .from("profiles")
            .upsert({ id: user.id, username, email }, { onConflict: "id" });
        if (pErr) return Alert.alert("Kayıt Hatası", pErr.message);

        // 📌 Çocuk kaydı
        const { data: childData, error: cErr } = await supabase
            .from("children")
            .insert({
                parent_id: user.id,
                name: childName,
                birthdate: birthDate ? birthDate.toISOString().split("T")[0] : null,
                gender,
                height: height.toString(),
                weight: weight.toString(),
                sleep_pattern: sleepPattern,
                allergies: allergies.join(", "),
                vaccines: vaccines.join(", "),
                illnesses: illnesses.join(", "),

            })
            .select()
            .single();

        if (cErr) return Alert.alert("Çocuk Kaydı Hatası", cErr.message);

        // 📌 Aktif çocuk id güncelle
        await supabase
            .from("profiles")
            .update({ selected_child_id: childData.id })
            .eq("id", user.id);

        Alert.alert("Başarılı", "Hesap ve çocuk bilgileri oluşturuldu.");
        router.replace("/(tabs)/home");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, backgroundColor: theme.background }}>
                    {/* ✅ StatusBar */}
                    <StatusBar
                        backgroundColor={theme.headerBg}
                        barStyle={isDark ? "light-content" : "dark-content"}
                    />

                    {/* ✅ Navbar */}
                    <View style={commonStyles.header}>
                        <TouchableOpacity
                            style={commonStyles.headerIconLeft}
                            onPress={() => router.replace("/(auth)/sign-in")}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={isDark ? "#fff" : "#000"}
                            />
                        </TouchableOpacity>
                        <Text style={commonStyles.headerTitle}>📝 Kayıt Ol</Text>
                        <View style={commonStyles.headerIconRight} />
                    </View>

                    {/* ✅ ScrollView ile form alanları */}
                    <ScrollView
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingBottom: 40,
                            marginTop: 20
                        }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={commonStyles.sectionTitle}>Profil Bilgileri</Text>
                        {/* Kullanıcı bilgileri */}
                        <TextInput
                            placeholder="Kullanıcı adı"
                            value={username}
                            onChangeText={setUsername}
                            style={commonStyles.input}
                            placeholderTextColor="#6b7280"
                        />
                        <TextInput
                            placeholder="E-posta"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            style={commonStyles.input}
                            placeholderTextColor="#6b7280"
                        />
                        <TextInput
                            placeholder="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={commonStyles.input}
                            placeholderTextColor="#6b7280"
                        />

                        <Text style={commonStyles.sectionTitle}>Çocuk Bilgileri</Text>

                        {/* Adı + Doğum Tarihi */}
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
                                    display="calendar"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setBirthDate(selectedDate);
                                    }}
                                />
                            )}
                        </View>

                        {/* Cinsiyet */}
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
                                                gender === option &&
                                                commonStyles.genderBtnTextSelected,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Boy */}
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
                                />

                                <TouchableOpacity
                                    onPress={() => setHeight((prev) => Math.min(250, prev + 1))}
                                    style={commonStyles.counterBtn}
                                >
                                    <Text style={commonStyles.counterText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Kilo */}
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
                                />

                                <TouchableOpacity
                                    onPress={() => setWeight((prev) => Math.min(200, prev + 1))}
                                    style={commonStyles.counterBtn}
                                >
                                    <Text style={commonStyles.counterText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Uyku Düzeni */}
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

                        {/* Diğer Alanlar: Alerji, Aşı, Hastalık */}
                        <View style={commonStyles.card}>
                            <View style={commonStyles.card}>
                                <Text style={commonStyles.label}>Alerjiler</Text>
                                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                    {ALLERGIES.map((item) => (
                                        <Chip
                                            key={item}
                                            label={item}
                                            selected={allergies.includes(item)}
                                            onPress={() => {
                                                setAllergies((prev) =>
                                                    prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
                                                );
                                            }}
                                            color="#60a5fa"
                                        />
                                    ))}
                                </View>

                                <Text style={commonStyles.label}>Aşılar</Text>
                                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                    {VACCINES.map((item) => (
                                        <Chip
                                            key={item}
                                            label={item}
                                            selected={vaccines.includes(item)}
                                            onPress={() => {
                                                setVaccines((prev) =>
                                                    prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
                                                );
                                            }}
                                            color="#f59e0b"
                                        />
                                    ))}
                                </View>

                                <Text style={commonStyles.label}>Hastalıklar</Text>
                                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                    {DISEASES.map((item) => (
                                        <Chip
                                            key={item}
                                            label={item}
                                            selected={illnesses.includes(item)}
                                            onPress={() => {
                                                setIllnesses((prev) =>
                                                    prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
                                                );
                                            }}
                                            color="#34d399"
                                        />
                                    ))}
                                </View>
                            </View>

                        </View>

                        {/* Kayıt Butonu */}
                        <TouchableOpacity onPress={onSignUp} style={commonStyles.submitBtn}>
                            <Text style={commonStyles.submitText}>Kayıt Ol</Text>
                        </TouchableOpacity>

                        <Text style={commonStyles.authLink}>
                            Zaten hesabın var mı? <Link href="/(auth)/sign-in">Giriş yap</Link>
                        </Text>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
