import React from "react";
import { View, Text, TouchableOpacity, Linking, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { router } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";

export default function SupportScreen() {
    const { commonStyles, theme } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar backgroundColor={theme.headerBg} barStyle={theme.statusBar} />

            {/* Header */}
            <View style={commonStyles.header}>
                <TouchableOpacity onPress={() => router.replace("/settings")} style={commonStyles.headerIconLeft}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>💬 Destek & İletişim</Text>
            </View>

            {/* İçerik */}
            <View style={commonStyles.card}>
                <Text style={commonStyles.sectionTitle}>Bize Ulaşın</Text>
                <Text style={commonStyles.detail}>📧 E-posta: shevmaidestek@gmail.com</Text>
                <Text style={commonStyles.detail}>📞 Telefon: +90 555 123 45 67</Text>
                <Text style={commonStyles.detail}>🌍 Web: www.shevmai.com</Text>

                <TouchableOpacity
                    style={[commonStyles.btnPrimary, { marginTop: 12 }]}
                    onPress={() => Linking.openURL("mailto:shevmaidestek@gmail.com")}
                >
                    <Text style={commonStyles.btnPrimaryText}>E-posta Gönder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[commonStyles.btnOutline, { marginTop: 8 }]}
                    onPress={() => Linking.openURL("tel:+905369563553")}
                >
                    <Text style={commonStyles.btnOutlineText}>Telefon Et</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
