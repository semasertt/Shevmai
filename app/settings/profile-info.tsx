import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const { commonStyles, theme, isDark } = useTheme();
    const [username, setUsername] = useState(""); // değiştirilemez
    const [email, setEmail] = useState(""); // değiştirilebilir
    const [password, setPassword] = useState(""); // yeni şifre

    // ✅ Kullanıcı bilgilerini çek
    useEffect(() => {
        const loadProfile = async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                Alert.alert("Hata", "Kullanıcı bilgileri alınamadı.");
                return;
            }

            // profiles tablosundan username al
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .maybeSingle();

            if (profileError) {
                Alert.alert("Hata", "Profil bilgileri yüklenemedi.");
            }

            setUsername(profile?.username ?? ""); // sadece gösterilecek
            setEmail(user.email ?? "");
        };

        loadProfile();
    }, []);

    // ✅ Kaydet
    const onSave = async () => {
        try {
            // e-posta güncelle
            if (email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email,
                });
                if (emailError) throw emailError;
            }

            // şifre güncelle
            if (password) {
                const { error: passError } = await supabase.auth.updateUser({
                    password,
                });
                if (passError) throw passError;
            }

            Alert.alert("Başarılı", "Profil bilgileriniz güncellendi.");
            setPassword(""); // şifre alanını sıfırla
        } catch (err: any) {
            Alert.alert("Hata", err.message ?? "Güncelleme başarısız.");
        }
    };

    return (
        <SafeAreaView style={commonStyles.page}>
            <StatusBar
                backgroundColor={theme.headerBg}
                barStyle={isDark ? "light-content" : "dark-content"}
            />

            {/* Header */}
            <View style={commonStyles.header}>
                <TouchableOpacity onPress={() => router.replace("/settings")} style={commonStyles.headerIconLeft}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>👤 Profil Bilgilerim</Text>
                <View style={commonStyles.headerIconRight} />
            </View>

            {/* Form */}
            <View style={commonStyles.card}>
                <Text style={commonStyles.label}>Kullanıcı Adı (Değiştirilemez)</Text>
                <TextInput
                    value={username}
                    editable={false}
                    style={[commonStyles.input, { backgroundColor: theme.cardLight }]}
                />

                <Text style={commonStyles.label}>E-posta</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    style={commonStyles.input}
                    placeholder="E-posta"
                    placeholderTextColor={theme.secondaryText}
                    autoCapitalize="none"
                />

                <Text style={commonStyles.label}>Yeni Şifre</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={commonStyles.input}
                    placeholder="Yeni şifre"
                    placeholderTextColor={theme.secondaryText}
                    secureTextEntry
                />

                <TouchableOpacity style={commonStyles.authButton} onPress={onSave}>
                    <Text style={commonStyles.authButtonText}>Kaydet</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
