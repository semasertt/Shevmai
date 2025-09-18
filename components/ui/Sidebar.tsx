import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Sidebar({ conversations, onSelect, onClose }: any) {
    return (
        <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Eski Konuşmalar</Text>
    <FlatList
    data={conversations}
    keyExtractor={(item) => String(item.id)}
    renderItem={({ item }) => (
        <TouchableOpacity style={styles.sidebarItem} onPress={() => onSelect(item)}>
    <Ionicons name="chatbubbles-outline" size={18} color="#e2e8f0" />
    <Text numberOfLines={1} style={styles.sidebarText}>{item.title}</Text>
        </TouchableOpacity>
)}
    />
    <TouchableOpacity style={styles.sidebarClose} onPress={onClose}>
    <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        </View>
);
}

const styles = StyleSheet.create({
    sidebar: { width: 260, height: "100%", backgroundColor: "#1e293b", padding: 16 },
    sidebarTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#fff" },
    sidebarItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#334155" },
    sidebarText: { color: "#e2e8f0", fontSize: 14, marginLeft: 8 },
    sidebarClose: { position: "absolute", top: 10, right: 10 },
});
