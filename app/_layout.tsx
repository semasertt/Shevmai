import React from "react";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

function TabsLayout() {
    // useTheme BURADA olabilir (çünkü ThemeProvider üstte olacak)
    // const { commonStyles, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                // şimdilik commonStyles yerine direkt style veriyoruz
                tabBarStyle: { backgroundColor: "#f5ede3", height: 90 },
                tabBarActiveTintColor: "#b47e5d",
                tabBarInactiveTintColor: "#9ca3af",
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
                        <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={size}
                            color={color}
                        />
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

export default function RootLayout() {
    return (
        <ThemeProvider>
            <TabsLayout />
        </ThemeProvider>
    );
}
