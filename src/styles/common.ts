import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
    // GENEL
    container: { flex: 1, backgroundColor: "#fff", padding: 24, paddingBottom: 32 },
    page: { flex: 1, backgroundColor: "#fff", padding: 16, paddingBottom: 32 },
    sectionTitle: { color: "#5c4033", fontSize: 18, fontWeight: "700", marginBottom: 10 },

    // ONBOARDING
    onboardingContainer: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 24,
        gap: 16,
        justifyContent: "center",
    },
    onboardingTitle: {
        color: "#5c4033",
        fontSize: 26,
        fontWeight: "800",
        textAlign: "center",
    },
    onboardingDesc: {
        color: "#6b7280",
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
        color: "#5c4033",
    },
    authContainer: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        gap: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#fff",
        color: "#111827",
    },
    authButton: {
        backgroundColor: "#b47e5d",
        padding: 14,
        borderRadius: 12,
    },
    authButtonText: { textAlign: "center", fontWeight: "700", color: "#fff" },
    authLink: { textAlign: "center", color: "#5c4033" },

    // BUTONLAR
    btnPrimary: {
        backgroundColor: "#b47e5d",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    btnOutline: {
        borderWidth: 2,
        borderColor: "#b47e5d",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
    },
    btnOutlineText: { color: "#b47e5d", fontWeight: "700", fontSize: 16 },
    btnDark: {
        backgroundColor: "#5c4033",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    btnDarkText: { color: "#fff", fontWeight: "600" },
    btnDanger: {
        borderWidth: 1,
        borderColor: "#ef4444",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    btnDangerText: { color: "#ef4444", fontWeight: "600" },

    // EDIT BUTTON (Profile)
    editBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#b47e5d",
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: "flex-start",
    },
    editBtnText: { color: "#fff", marginLeft: 6, fontWeight: "600" },

    // HEADER
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        padding: 15,
        paddingTop: 30,
        backgroundColor: "#fffaf5", // biraz daha açık
    },
    headerTitle: { color: "#5c4033", fontSize: 20, fontWeight: "700" },

    // CARD
    card: {
        backgroundColor: "#f5ede3",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    cardLight: {
        backgroundColor: "#fffaf5",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#d4af37",
        marginBottom: 12,
    },
    name: { fontSize: 20, fontWeight: "700", color: "#5c4033", marginBottom: 8 },
    detail: { fontSize: 15, color: "#5c4033", marginTop: 4 }, // ✅ kahverengi yapıldı

    // CHILD CARD (choose-child)
    childCard: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: "#f5ede3",
        marginBottom: 10,
    },
    childName: { color: "#5c4033", fontSize: 16, fontWeight: "600" },
    childDetail: { color: "#6b7280", fontSize: 14, marginTop: 4 },

    // STAT CARDS
    statsGrid: { flexDirection: "row", justifyContent: "space-between" },
    statCard: {
        backgroundColor: "#fffaf5", // ✅ uyumlu hale getirildi
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 5,
    },
    statNumber: {
        color: "#5c4033",
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 5,
    },
    statLabel: { color: "#6b7280", fontSize: 12 },

    // CHATBOT
    chatContainer: { padding: 10, flexGrow: 1, justifyContent: "flex-end" },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#fff",
        alignItems: "center",
    },
    inputChat: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 16,
        color: "#111827",
        maxHeight: 100,
        backgroundColor: "#fff",
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: "#b47e5d",
        borderRadius: 20,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    sidebarOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    sidebarContainer: { marginTop: 60, height: "80%" },

    // FORM LABEL & COUNTERS
    label: { marginBottom: 8, fontWeight: "bold", color: "#5c4033" },
    counterRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    counterBtn: { backgroundColor: "#b47e5d", padding: 10, borderRadius: 8 },
    counterText: { color: "#fff", fontSize: 20, fontWeight: "bold" },

    // SETTINGS
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    settingText: { color: "#5c4033", marginLeft: 10, fontSize: 16 },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ef4444",
        padding: 14,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: "center",
    },
    logoutText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },

    // MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15,
        width: "80%",
    },
    modalTitle: { color: "#5c4033", fontSize: 18, fontWeight: "bold", marginBottom: 20 },
    modalButtons: { flexDirection: "row", justifyContent: "space-between" },
    modalButton: {
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
        alignItems: "center",
    },
    cancelButton: { backgroundColor: "#d1d5db" },
    saveButton: { backgroundColor: "#b47e5d" },
    modalButtonText: { color: "#fff", fontWeight: "bold" },

    // BOŞ MESAJLAR
    emptyText: {
        textAlign: "center",
        marginTop: 40,
        color: "#9ca3af",
        fontSize: 14,
    },

    // HOME TAKVIM
    calendarWrap: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        padding: 8,
        elevation: 3,
    },

    // SIGN UP EKSTRA
    scrollContainer: { flexGrow: 1, justifyContent: "center" },
    genderBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 10,
        alignItems: "center",
        marginHorizontal: 4,
        marginBottom: 8,
    },
    genderBtnSelected: { backgroundColor: "#b47e5d", borderColor: "#b47e5d" },
    genderBtnText: { color: "#111827", fontWeight: "600" },
    genderBtnTextSelected: { color: "#fff" },
    submitBtn: {
        backgroundColor: "#b47e5d",
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    submitText: { textAlign: "center", fontWeight: "800", color: "#fff" },

    // TITLE + DESC
    title: {
        color: "#5c4033",
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 12,
    },
    desc: { color: "#6b7280", fontSize: 16 },
    descCenter: {
        color: "#6b7280",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 8,
    },

    // CATEGORY PAGE
    recordItem: {
        backgroundColor: "#f5ede3",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    recordTitle: { color: "#5c4033", fontSize: 16, fontWeight: "700", marginBottom: 6 },
    recordText: { color: "#6b7280", fontSize: 14, marginBottom: 6 },
    recordImage: { width: "100%", height: 180, borderRadius: 10, marginTop: 8 },
    empty: { color: "#9ca3af", fontSize: 16, textAlign: "center", marginTop: 20 },

    // NAVIGATION
    tabBar: {
        backgroundColor: "#f5ede3",
        height: 90,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingBottom: 10, // ✅ tuşlarla çakışmayı önler
    },
});
export const themeColors = {
    tabBarActive: "#b47e5d",
    tabBarInactive: "#9ca3af",
};
