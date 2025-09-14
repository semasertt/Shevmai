import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import React, { JSX } from "react";

export const getTabScreenOptions = (label: string, icon: JSX.Element) => ({
    title: label,
    tabBarLabel: label,
    tabBarIcon: ({ color, size }: { color: string; size: number }) =>
        // gelen icon'u renklendir ve boyutunu ayarla
        React.cloneElement(icon, { color, size }),
    tabBarLabelStyle: {
        textAlign: "center" as const,
        fontSize: 12,
        marginTop: 5,
    },
    tabBarIconStyle: {
        marginBottom: -2,
    },
});
