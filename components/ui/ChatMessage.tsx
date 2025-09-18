import { View, Text, Image, StyleSheet } from "react-native";

export default function ChatMessage({ item }: { item: any }) {
    return (
        <View style={[styles.message, item.role === "user" ? styles.userMessage : styles.botMessage]}>
            {item.type === "image" ? (
                <Image source={{ uri: item.uri }} style={styles.image} />
            ) : (
                <Text style={styles.messageText}>{item.text}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    message: { padding: 12, borderRadius: 12, marginVertical: 6, maxWidth: "80%" },
    userMessage: { backgroundColor: "#2563eb", alignSelf: "flex-end" },
    botMessage: { backgroundColor: "#334155", alignSelf: "flex-start" },
    messageText: { fontSize: 16, color: "#fff" },
    image: { width: 150, height: 150, borderRadius: 8 },
});

