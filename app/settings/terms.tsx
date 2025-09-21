import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { router } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";

export default function TermsScreen() {
    const { commonStyles, theme } = useTheme();

    return (
        <SafeAreaView  style={{ flex: 1, backgroundColor: theme.background }} edges={["top"]}>
            <StatusBar backgroundColor={theme.headerBg} barStyle={theme.statusBar} />

            {/* Header */}
            <View style={commonStyles.header}>
                <TouchableOpacity onPress={() => router.replace("/settings")} style={commonStyles.headerIconLeft}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>📜 Kullanım Koşulları</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={commonStyles.card}>
                    <Text style={commonStyles.sectionTitle}>Genel</Text>
                    <Text style={commonStyles.detail}>
                        Bu uygulamayı kullanarak kişisel verilerinizin yalnızca sizin hesabınıza özel
                        saklanmasını kabul etmiş olursunuz.
                    </Text>
                </View>

                <View style={commonStyles.card}>
                    <Text style={commonStyles.sectionTitle}>Sorumluluk Reddi</Text>
                    <Text style={commonStyles.detail}>
                        Uygulama, sağlık profesyoneli tavsiyesinin yerini almaz. Tıbbi acil
                        durumlarda doktorunuza başvurun.
                    </Text>
                </View>

                <View style={commonStyles.card}>
                    <Text style={commonStyles.sectionTitle}>Veri Kullanımı</Text>
                    <Text style={commonStyles.detail}>
                        Veriler yalnızca sizin takip amaçlı kullanımınız için saklanır. Üçüncü
                        kişilerle paylaşılmaz.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
