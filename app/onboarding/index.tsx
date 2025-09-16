import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingIndex() {
    const router = useRouter();

    return (
        <View style={s.container}>
            <Text style={s.title}>HOŞGELDİNİZ</Text>
            <Text style={s.desc}>Devam etmek için bir seçenek seçin:</Text>

            <TouchableOpacity style={s.btnPrimary} onPress={() => router.push('/choose-child')}>
                <Text style={s.btnPrimaryText}>👶 Çocuk Seçme</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.btnOutline} onPress={() => router.push('/onboarding/add-child')}>
                <Text style={s.btnOutlineText}>➕ Çocuk Ekleme</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 24, gap: 16, justifyContent: 'center' },
    title: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center' },
    desc: { color: '#cbd5e1', fontSize: 16, textAlign: 'center', marginBottom: 8 },
    btnPrimary: { backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    btnOutline: { borderWidth: 2, borderColor: '#3b82f6', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    btnOutlineText: { color: '#3b82f6', fontWeight: '700', fontSize: 16 },
});
