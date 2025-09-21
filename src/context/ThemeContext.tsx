import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCommonStyles } from "@/src/styles/common";
import { lightTheme, darkTheme } from "@/src/styles/themes";

type ThemeContextType = {
    isDark: boolean;
    toggleTheme: () => void;
    theme: typeof lightTheme;
    commonStyles: ReturnType<typeof getCommonStyles>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(false);

    // ⏳ Uygulama açıldığında kayıtlı temayı yükle
    useEffect(() => {
        (async () => {
            const savedTheme = await AsyncStorage.getItem("theme");
            if (savedTheme === "dark") setIsDark(true);
        })();
    }, []);

    // 🌙 Tema değiştir
    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    const theme = isDark ? darkTheme : lightTheme;
    const commonStyles = getCommonStyles(isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, theme, commonStyles }}>
            {children}
        </ThemeContext.Provider>
    );
};

// ✅ Kullanım için hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
