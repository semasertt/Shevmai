import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { router } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";

export default function NotificationsScreen() {
    const { commonStyles, theme } = useTheme();
    const [reminders, setReminders] = useState(true);
    const [news, setNews] = useState(false);

    return (
        <SafeAreaView  style={{ flex: 1, backgroundColor: theme.background }} edges={["top"]}>
            <StatusBar backgroundColor={theme.headerBg} barStyle={theme.statusBar} />

            {/* Header */}
            <View style={commonStyles.header}>
                <TouchableOpacity onPress={() => router.replace("/settings")} style={commonStyles.headerIconLeft}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={commonStyles.headerTitle}>🔔 Bildirimler</Text>
            </View>

            {/* İçerik */}
            <View style={commonStyles.card}>
                <View style={commonStyles.settingItem}>
                    <Text style={commonStyles.settingText}>💉 Aşı hatırlatmaları</Text>
                    <Switch
                        value={reminders}
                        onValueChange={setReminders}
                        trackColor={{ false: theme.border, true: theme.primary }}
                        thumbColor={reminders ? theme.onPrimary : "#f4f3f4"}
                    />
                </View>

                <View style={commonStyles.settingItem}>
                    <Text style={commonStyles.settingText}>📰 Güncellemeler & Haberler</Text>
                    <Switch
                        value={news}
                        onValueChange={setNews}
                        trackColor={{ false: theme.border, true: theme.primary }}
                        thumbColor={news ? theme.onPrimary : "#f4f3f4"}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
