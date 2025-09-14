import { View, Text, StyleSheet } from 'react-native';

export default function Profile() {
    return (
        <View style={s.container}>
            <Text style={s.title}>Profil</Text>
            <Text style={s.info}>Burası profildsfsfdsf sayfası. (Şimdilik sadece başlık.)</Text>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 20, gap: 10 },
    title: { color: '#fff', fontSize: 22, fontWeight: '800' },
    info: { color: '#cbd5e1' },
});
