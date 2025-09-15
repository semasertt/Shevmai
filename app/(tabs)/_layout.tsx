// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: "#0b1020" },
                headerTintColor: "#fff",
                tabBarStyle: { backgroundColor: "#0b1020", height: 90 },
                tabBarActiveTintColor: "#60a5fa",
                tabBarInactiveTintColor: "#94a3b8",
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Anasayfa",
                    tabBarLabel: "Anasayfa",
                    tabBarIcon: () => <Ionicons name="home-outline" />,
                }}
            />
            <Tabs.Screen
                name="chatbot"
                options={{
                    title: "Chatbot",
                    tabBarLabel: "Chatbot",
                    tabBarIcon: () => <Ionicons name="chatbubble-ellipses-outline" />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarLabel: "Profil",
                    tabBarIcon: () => <Ionicons name="person-outline" />,
                }}
            />
        </Tabs>
    );
}
