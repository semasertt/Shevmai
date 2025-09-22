import 'dotenv/config';

export default {
    expo: {
        name: "ShevmAI - Ebeveyn Sağlık Asistanı",
        slug: "copi",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",

        splash: {
            image: "./assets/icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },

        updates: {
            fallbackToCacheTimeout: 0
        },

        assetBundlePatterns: ["**/*"],

        android: {
            adaptiveIcon: {
                backgroundColor: "#E6F4FE",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png"
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            package: "com.sevvalpamuk.w5"
        },

        web: {
            output: "static",
            favicon: "./assets/images/favicon.png"
        },

        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                    dark: {
                        backgroundColor: "#000000"
                    }
                }
            ]
        ],

        experiments: {
            typedRoutes: true,
            reactCompiler: true
        },

        extra: {
            router: {},
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: "6218416c-bc41-4b5b-8522-cae589deb7f0" // ✅ sadece 1 tane projectId
            }
        },

        owner: "sevvalpamuk"
    }
};
