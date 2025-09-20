import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles, themeColors } from "@/src/styles/common";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false, // üst başlık gizli
                tabBarStyle: commonStyles.tabBar,
                tabBarActiveTintColor: themeColors.tabBarActive,
                tabBarInactiveTintColor: themeColors.tabBarInactive,
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
