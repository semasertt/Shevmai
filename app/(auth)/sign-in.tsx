import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Platform,
    Keyboard,
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { commonStyles } from "app/styles/common";

async function resolveEmail(identity: string): Promise<string | null> {
    if (identity.includes("@")) return identity;

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
    const [identity, setIdentity] = useState("");
    const [password, setPassword] = useState("");

    const onSignIn = async () => {
        const email = await resolveEmail(identity.trim());
        if (!email) return Alert.alert("Giriş Hatası", "Kullanıcı adı veya e-posta bulunamadı.");

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return Alert.alert("Giriş Hatası", error.message);

        router.replace("/onboarding");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={commonStyles.authContainer}>
                    <Text style={commonStyles.authTitle}>Giriş Yap</Text>

                    <TextInput
                        placeholder="Kullanıcı adı veya e-posta"
                        autoCapitalize="none"
                        value={identity}
                        onChangeText={setIdentity}
                        style={commonStyles.input}
                    />
                    <TextInput
                        placeholder="Şifre"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        style={commonStyles.input}
                    />

                    <TouchableOpacity onPress={onSignIn} style={commonStyles.authButton}>
                        <Text style={commonStyles.authButtonText}>Giriş Yap</Text>
                    </TouchableOpacity>

                    <Text style={commonStyles.authLink}>
                        Hesabın yok mu? <Link href="/(auth)/sign-up">Kayıt ol</Link>
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
