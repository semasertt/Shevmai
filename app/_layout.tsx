import React from "react";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { Tabs, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LogBox } from "react-native";

// ✅ Uyarıları gizle
LogBox.ignoreLogs([
    "Route .* is missing the required default export",
    "Linking requires a build-time setting `scheme`",
]);
LogBox.ignoreAllLogs(false); // false = sadece yukarıdaki listeyi gizler

function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
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

// ✅ Tek bir default export bırakıyoruz
export default function RootLayout() {
    return (
        <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}>
                {/* Tabs layout'u stack içine koy */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </ThemeProvider>
    );
}
