import { Tabs } from "expo-router";
// @ts-ignore
import { getTabScreenOptions } from "../../src/utils/tabOptions";
import {Ionicons} from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: "#0b1020" },
                headerTintColor: "#fff",
                tabBarStyle: { backgroundColor: "#0b1020", height: 60 },
                tabBarActiveTintColor: "#60a5fa",
                tabBarInactiveTintColor: "#94a3b8",
            }}
        >
            <Tabs.Screen
                name="home"
                options={getTabScreenOptions("Anasayfa", <Ionicons name="home-outline" />)}
            />

            <Tabs.Screen
                name="chatbot"
                options={getTabScreenOptions("Chatbot", <Ionicons name="chatbubble-ellipses-outline" />)}
            />

            <Tabs.Screen
                name="profile"
                options={getTabScreenOptions("Profil", <Ionicons name="person-outline" />)}
            />

        </Tabs>
    );
}
