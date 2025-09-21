import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";

export default function Sidebar({ conversations, onSelect, onClose }: any) {
    const { commonStyles } = useTheme();

    return (
        <View style={commonStyles.sidebar}>
            <Text style={commonStyles.sidebarTitle}>Eski Konuşmalar</Text>

            <FlatList
                data={conversations}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={commonStyles.sidebarItem}
                        onPress={() => onSelect(item)}
                    >
                        <Ionicons name="chatbubbles-outline" size={18} color={commonStyles.sidebarText.color} />
                        <Text numberOfLines={1} style={commonStyles.sidebarText}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                style={commonStyles.sidebarClose}
                onPress={onClose}
            >
                <Ionicons name="close" size={24} color={commonStyles.sidebarTitle.color} />
            </TouchableOpacity>
        </View>
    );
}
