import { View, Text, StyleSheet } from 'react-native';

export default function Chatbot() {
    return (
        <View style={s.container}>
            <Text style={s.title}>Chatbot</Text>
            <Text style={s.info}>Burası chatbot sayfası. (Şimdilik sadece başlık.)</Text>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 20, gap: 10 },
    title: { color: '#fff', fontSize: 22, fontWeight: '800' },
    info: { color: '#cbd5e1' },
});
