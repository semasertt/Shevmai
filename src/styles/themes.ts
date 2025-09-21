import { StatusBarStyle } from "react-native";

export const lightTheme: { [key: string]: any; statusBar: StatusBarStyle } = {
    background: "#ffffff",
    headerBg: "#f5ede3",
    text: "#1e293b",
    secondaryText: "#6b7280",
    border: "#d1d5db",
    card: "#f9f9f9",
    cardLight: "#f5f5f5",
    avatarBorder: "#e5e7eb",
    primary: "#b47e5d",
    onPrimary: "#ffffff",
    link: "#2563eb",
    darkBtn: "#374151",
    danger: "#ef4444",

    // 🔹 Status bar için
    statusBar: "dark-content",
};

export const darkTheme: { [key: string]: any; statusBar: StatusBarStyle } = {
    background: "#0f172a",
    headerBg: "#1e293b",
    text: "#f9fafb",
    secondaryText: "#9ca3af",
    border: "#334155",
    card: "#1e293b",
    cardLight: "#334155",
    avatarBorder: "#475569",
    primary: "#b47e5d",
    onPrimary: "#ffffff",
    link: "#60a5fa",
    darkBtn: "#4b5563",
    danger: "#ef4444",

    // 🔹 Status bar için
    statusBar: "light-content",
};
