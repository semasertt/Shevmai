import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { getCommonStyles } from "@/src/styles/common";

export default function TabsLayout() {
    // 🔹 Buradan alıyoruz
    const { isDark } = useTheme();
    const commonStyles = getCommonStyles(isDark);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: commonStyles.tabBar,
                tabBarActiveTintColor: isDark ? "#b47e5d" : "#5c4033", // örnek: temaya göre değişir
                tabBarInactiveTintColor: isDark ? "#9ca3af" : "#d1d5db",
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    tabBarLabel: "Anasayfa",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chatbot"
                options={{
                    tabBarLabel: "Chatbot",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: "Profil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
