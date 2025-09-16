import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {router} from "expo-router";

export default function Profile() {
    return (
        <View style={s.container}>
            <Text style={s.title}>Profil</Text>
            <Text style={s.info}>Burası profil sayfası. (Şimdilik sadece başlık.)</Text>
            <TouchableOpacity
                onPress={() => router.push('/choose-child')}
                style={{ marginTop:12, borderWidth:1, borderColor:'#e5e7eb', padding:10, borderRadius:10 }}
            >
                <Text>Çocuk Değiştir</Text>
            </TouchableOpacity>
        </View>

    );
}

const s = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 10 },
    title: {  fontSize: 22, fontWeight: '800' },
    info: {  },
});
