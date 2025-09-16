import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    KeyboardAvoidingView, Platform, Keyboard
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSignUp = async () => {
        if (!username.trim()) return Alert.alert("Uyarı", "Kullanıcı adı gerekli.");
        if (!email.trim()) return Alert.alert("Uyarı", "E-posta gerekli.");
        if (!password.trim()) return Alert.alert("Uyarı", "Şifre gerekli.");

        // 1) Hesabı oluştur
        const { error: sErr } = await supabase.auth.signUp({ email, password });
        if (sErr) return Alert.alert("Kayıt Hatası", sErr.message);

        // 2) Hemen giriş yap (session oluştur) → RLS için şart
        const { error: iErr } = await supabase.auth.signInWithPassword({ email, password });
        if (iErr) return Alert.alert("Giriş Hatası", iErr.message);

        // 3) Artık auth.uid() mevcut → profiles’a güvenli insert
        const { data: u } = await supabase.auth.getUser();
        if (!u?.user) return Alert.alert("Hata", "Kullanıcı bilgisi alınamadı.");

        // Benzersizliği korumak için upsert kullan (id/username/email unique)
        const { error: pErr } = await supabase
            .from("profiles")
            .upsert(
                { id: u.user.id, username, email },
                { onConflict: "id" } // aynı id varsa günceller
            );

        if (pErr) return Alert.alert("Kayıt Hatası", pErr.message);

        Alert.alert("Başarılı", "Hesap oluşturuldu.");
        router.replace("/onboarding");
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
                    <Text style={{ fontSize: 26, fontWeight: "800", textAlign: "center" }}>
                        Kayıt Ol
                    </Text>

                    <TextInput
                        placeholder="Kullanıcı adı"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
                    />
                    <TextInput
                        placeholder="E-posta"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
                    />
                    <TextInput
                        placeholder="Şifre"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
                    />

                    <TouchableOpacity
                        onPress={onSignUp}
                        style={{
                            backgroundColor: "#22c55e",
                            padding: 14,
                            borderRadius: 12,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                fontWeight: "800",
                                color: "#fff",
                            }}
                        >
                            Kayıt Ol
                        </Text>
                    </TouchableOpacity>

                    <Text style={{ textAlign: "center" }}>
                        Zaten hesabın var mı? <Link href="/(auth)/sign-in">Giriş yap</Link>
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
