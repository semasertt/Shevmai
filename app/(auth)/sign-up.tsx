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
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/src/context/ThemeContext";


export default function SignUp() {
    const { commonStyles } = useTheme();
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

        // 📌 Profil kaydı (duplicate önlemek için upsert)
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
                allergies,
                vaccines,
                illnesses,
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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={commonStyles.page}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView contentContainerStyle={commonStyles.scrollContainer}>
                    <Text style={commonStyles.authTitle}>Kayıt Ol</Text>

                    {/* Kullanıcı bilgileri */}
                    <View style={commonStyles.card}>
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
                    </View>

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
                                            gender === option && commonStyles.genderBtnTextSelected,
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
                                            sleepPattern === option && commonStyles.genderBtnSelected,
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

                    {/* Diğer Alanlar */}
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

                    <TouchableOpacity onPress={onSignUp} style={commonStyles.submitBtn}>
                        <Text style={commonStyles.submitText}>Kayıt Ol</Text>
                    </TouchableOpacity>

                    <Text style={commonStyles.authLink}>
                        Zaten hesabın var mı? <Link href="/(auth)/sign-in">Giriş yap</Link>
                    </Text>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
