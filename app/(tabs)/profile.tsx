// örn. Profile/Settings ekranında
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Settings() {
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace("/(auth)/sign-in"); // giriş ekranına götür
    };

    return (
        <View>
            <Text>Hesap</Text>
            <Button title="Çıkış yap" onPress={handleSignOut} />
        </View>
    );
}
