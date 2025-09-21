import { StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "./themes";

export const getCommonStyles = (isDark: boolean) => {
    const theme = isDark ? darkTheme : lightTheme;

    return StyleSheet.create({
        // GENEL
        container: { flex: 1, backgroundColor: theme.background, paddingBottom: 32 },
        page: { flex: 1, backgroundColor: theme.background, paddingBottom: 32},
        sectionTitle: { color: theme.text, fontSize: 18, fontWeight: "700", marginBottom: 10 },

        // ONBOARDING
        onboardingContainer: {
            flex: 1,
            backgroundColor: theme.background,
            padding: 24,
            gap: 16,
            justifyContent: "center",
        },
        onboardingTitle: {
            color: theme.text,
            fontSize: 26,
            fontWeight: "800",
            textAlign: "center",
        },
        onboardingDesc: {
            color: theme.secondaryText,
            fontSize: 16,
            textAlign: "center",
            marginBottom: 8,
        },

        // AUTH
        authTitle: {
            fontSize: 26,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 16,
            color: theme.text,
        },
        authContainer: {
            flex: 1,
            justifyContent: "center",
            padding: 20,
            gap: 12,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.border,
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
            backgroundColor: theme.card,
            color: theme.text,
        },
        authButton: {
            backgroundColor: theme.primary,
            padding: 14,
            borderRadius: 12,
        },
        authButtonText: { textAlign: "center", fontWeight: "700", color: theme.onPrimary },
        authLink: { textAlign: "center", color: theme.link },

        // BUTONLAR
        btnPrimary: {
            backgroundColor: theme.primary,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
        },
        btnPrimaryText: { color: theme.onPrimary, fontWeight: "700", fontSize: 16 },
        btnOutline: {
            borderWidth: 2,
            borderColor: theme.primary,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
        },
        btnOutlineText: { color: theme.primary, fontWeight: "700", fontSize: 16 },
        btnDark: {
            backgroundColor: theme.darkBtn,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            alignItems: "center",
        },
        btnDarkText: { color: theme.onPrimary, fontWeight: "600" },
        btnDanger: {
            borderWidth: 1,
            borderColor: theme.danger,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
        },
        btnDangerText: { color: theme.danger, fontWeight: "600" },

        // EDIT BUTTON (Profile)
        editBtn: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.primary,
            padding: 10,
            borderRadius: 8,
            marginTop: 12,
            alignSelf: "flex-start",
        },
        editBtnText: { color: theme.onPrimary, marginLeft: 6, fontWeight: "600" },

        // HEADER
        safeArea: { backgroundColor: theme.background },
        header: {
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            paddingHorizontal: 12,
            backgroundColor: theme.headerBg,
        },
        headerTitle: {
            color: theme.text,
            fontSize: 20,
            fontWeight: "700",
            textAlign: "center",
            flex: 1,
        },
        headerIconLeft: { paddingLeft: 12 },
        headerIconRight: { paddingRight: 12 },

        placeholder: { alignItems: "center", justifyContent: "center" },

        // CARD
        card: {
            backgroundColor: theme.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
        },
        cardLight: {
            backgroundColor: theme.cardLight,
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
        },
        avatar: {
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: theme.avatarBorder,
            marginBottom: 12,
        },
        name: { fontSize: 20, fontWeight: "700", color: theme.text, marginBottom: 8 },
        detail: { fontSize: 15, color: theme.text, marginTop: 4 },

        // CHILD CARD (choose-child)
        childCard: {
            padding: 16,
            borderRadius: 10,
            backgroundColor: theme.card,
            marginBottom: 10,
        },
        childName: { color: theme.text, fontSize: 16, fontWeight: "600" },
        childDetail: { color: theme.secondaryText, fontSize: 14, marginTop: 4 },

        // STAT CARDS
        statsGrid: { flexDirection: "row", justifyContent: "space-between" },
        statCard: {
            backgroundColor: theme.cardLight,
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
            flex: 1,
            marginHorizontal: 5,
        },
        statNumber: { color: theme.text, fontSize: 20, fontWeight: "bold", marginVertical: 5 },
        statLabel: { color: theme.secondaryText, fontSize: 12 },

        // CHATBOT
        chatContainer: { padding: 10, flexGrow: 1, justifyContent: "flex-end" },
        inputContainer: {
            flexDirection: "row",
            padding: 10,
            borderTopWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
            alignItems: "center",
        },
        // CHAT MESSAGES
        chatMessage: {
            padding: 12,
            borderRadius: 12,
            marginVertical: 6,
            maxWidth: "80%",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
        },
        chatUser: {
            backgroundColor: theme.primary,
            alignSelf: "flex-end",
        },
        chatBot: {
            backgroundColor: theme.card,
            alignSelf: "flex-start",
        },
        chatText: {
            fontSize: 16,
            color: theme.text,
        },
        chatImage: {
            width: 150,
            height: 150,
            borderRadius: 10,
        },

        inputChat: {
            flex: 1,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 10,
            fontSize: 16,
            color: theme.text,
            maxHeight: 120,
            backgroundColor: theme.card,
        },
        sendButton: {
            marginLeft: 10,
            backgroundColor: theme.primary,
            borderRadius: 20,
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
        },
        sendButtonText: { color: theme.onPrimary, fontSize: 18, fontWeight: "bold" },

        // common.ts içindeki getCommonStyles fonksiyonuna ekle

// SIDEBAR
        sidebar: {
            width: 260,
            height: "100%",
            backgroundColor: theme.card,   // 🔹 Tema tabanlı
            padding: 16,
        },
        sidebarTitle: {
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 12,
            color: theme.text,
        },
        sidebarItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: theme.border,
        },
        sidebarText: {
            color: theme.secondaryText,
            fontSize: 14,
            marginLeft: 8,
        },
        sidebarClose: {
            position: "absolute",
            top: 10,
            right: 10,
        },

        // HOME TAKVİM
        calendarWrap: {
            backgroundColor: theme.background,
            borderRadius: 16,
            marginHorizontal: 16,
            padding: 8,
            elevation: 3,
        },

        // SIDEBAR
        sidebarOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "flex-start",
            justifyContent: "flex-start",
        },
        sidebarContainer: { marginTop: 60, height: "80%" },

        // FORM LABEL & COUNTERS
        label: { marginBottom: 8, fontWeight: "bold", color: theme.text },
        counterRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
        counterBtn: { backgroundColor: theme.primary, padding: 10, borderRadius: 8 },
        counterText: { color: theme.onPrimary, fontSize: 20, fontWeight: "bold" },

        // SETTINGS
        settingItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        settingText: { color: theme.text, marginLeft: 10, fontSize: 16 },
        logoutBtn: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.danger,
            padding: 14,
            borderRadius: 10,
            marginBottom: 20,
            justifyContent: "center",
        },
        logoutText: { color: theme.onPrimary, marginLeft: 8, fontWeight: "bold" },

        // MODAL
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
        },
        modalContent: {
            backgroundColor: theme.card,
            padding: 20,
            borderRadius: 15,
            width: "80%",
        },
        modalTitle: { color: theme.text, fontSize: 18, fontWeight: "bold", marginBottom: 20 },
        modalButtons: { flexDirection: "row", justifyContent: "space-between" },
        modalButton: {
            padding: 15,
            borderRadius: 10,
            flex: 1,
            marginHorizontal: 5,
            alignItems: "center",
        },
        cancelButton: { backgroundColor: theme.border },
        saveButton: { backgroundColor: theme.primary },
        modalButtonText: { color: theme.onPrimary, fontWeight: "bold" },

        // BOŞ MESAJLAR
        emptyText: {
            textAlign: "center",
            marginTop: 40,
            color: theme.secondaryText,
            fontSize: 14,
        },

        // SIGN UP EKSTRA
        scrollContainer: { flexGrow: 1, justifyContent: "center" },
        genderBtn: {
            flex: 1,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            padding: 10,
            alignItems: "center",
            marginHorizontal: 4,
            marginBottom: 8,
        },
        genderBtnSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
        genderBtnText: { color: theme.text, fontWeight: "600" },
        genderBtnTextSelected: { color: theme.onPrimary },
        submitBtn: {
            backgroundColor: theme.primary,
            padding: 14,
            borderRadius: 12,
            marginBottom: 20,
        },
        submitText: { textAlign: "center", fontWeight: "800", color: theme.onPrimary },

        // TITLE + DESC
        title: {
            color: theme.text,
            fontSize: 24,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 12,
        },
        desc: { color: theme.secondaryText, fontSize: 16 },
        descCenter: {
            color: theme.secondaryText,
            fontSize: 16,
            textAlign: "center",
            marginBottom: 8,
        },

        // CATEGORY PAGE
        recordItem: {
            backgroundColor: theme.card,
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
        },
        recordTitle: { color: theme.text, fontSize: 16, fontWeight: "700", marginBottom: 6 },
        recordText: { color: theme.secondaryText, fontSize: 14, marginBottom: 6 },
        recordImage: { width: "100%", height: 180, borderRadius: 10, marginTop: 8 },
        empty: { color: theme.secondaryText, fontSize: 16, textAlign: "center", marginTop: 20 },

        // NAVIGATION
        tabBar: {
            backgroundColor: theme.card,
            height: 90,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            paddingBottom: 10,
        },
    });
};

// 🔹 Varsayılan light theme export (eski import’lar bozulmasın diye)
export const commonStyles = getCommonStyles(false);

export const themeColors = {
    tabBarActive: "#b47e5d",
    tabBarInactive: "#9ca3af",
};
