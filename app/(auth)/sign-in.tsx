import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    TouchableWithoutFeedback, Platform, Keyboard
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";

async function resolveEmail(identity: string): Promise<string | null> {
    // identity '@' içeriyorsa direkt email kabul et
    if (identity.includes("@")) return identity;

    // değilse username'den email'i bul
    const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identity)
        .maybeSingle();

    if (error) {
        Alert.alert("Giriş Hatası", error.message);
        return null;
    }
    return data?.email ?? null;
}

export default function SignIn() {
    const [identity, setIdentity] = useState(""); // kullanıcı adı veya e-posta
    const [password, setPassword] = useState("");

    const onSignIn = async () => {
        const email = await resolveEmail(identity.trim());
        if (!email) return Alert.alert("Giriş Hatası", "Kullanıcı adı veya e-posta bulunamadı.");

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return Alert.alert("Giriş Hatası", error.message);

        router.replace("/home");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS için padding daha iyi çalışır
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
                    <Text style={{ fontSize: 26, fontWeight: "800", textAlign: "center" }}>
                        Giriş Yap
                    </Text>

                    <TextInput
                        placeholder="Kullanıcı adı veya e-posta"
                        autoCapitalize="none"
                        value={identity}
                        onChangeText={setIdentity}
                        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
                    />
                    <TextInput
                        placeholder="Şifre"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
                    />

                    <TouchableOpacity
                        onPress={onSignIn}
                        style={{
                            backgroundColor: "#2563eb",
                            padding: 14,
                            borderRadius: 12,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                fontWeight: "700",
                                color: "#fff",
                            }}
                        >
                            Giriş Yap
                        </Text>
                    </TouchableOpacity>

                    <Text style={{ textAlign: "center" }}>
                        Hesabın yok mu? <Link href="/(auth)/sign-up">Kayıt ol</Link>
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
