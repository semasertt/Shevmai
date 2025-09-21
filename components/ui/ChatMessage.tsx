import { View, Text, Image } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";

export default function ChatMessage({ item }: { item: any }) {
    const { commonStyles } = useTheme();

    return (
        <View
            style={[
                commonStyles.chatMessage,
                item.role === "user" ? commonStyles.chatUser : commonStyles.chatBot,
            ]}
        >
            {item.type === "image" ? (
                <Image source={{ uri: item.uri }} style={commonStyles.chatImage} />
            ) : (
                <Text
                    style={[
                        commonStyles.chatText,
                        item.role === "user" && { color: "#fff" }, // ✅ user için özel
                    ]}
                >
                    {item.text}
                </Text>
            )}
        </View>
    );
}
