import { View, Text, Image, StyleSheet } from "react-native";

export default function ChatMessage({ item }: { item: any }) {
    return (
        <View
            style={[
                styles.message,
                item.role === "user" ? styles.userMessage : styles.botMessage,
            ]}
        >
            {item.type === "image" ? (
                <Image source={{ uri: item.uri }} style={styles.image} />
            ) : (
                <Text
                    style={[
                        styles.messageText,
                        item.role === "user" && { color: "#fff" },
                    ]}
                >
                    {item.text}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    message: {
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
    userMessage: {
        backgroundColor: "#b47e5d", // ✅ common.ts buton rengi
        alignSelf: "flex-end",
    },
    botMessage: {
        backgroundColor: "#f5ede3", // ✅ common.ts kart rengi
        alignSelf: "flex-start",
    },
    messageText: {
        fontSize: 16,
        color: "#5c4033", // ✅ common.ts yazı rengi
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 10,
    },
});
