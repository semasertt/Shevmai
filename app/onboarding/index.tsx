import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {commonStyles} from "@/app/styles/common";

export default function OnboardingIndex() {
    const router = useRouter();

    return (
        <View style={commonStyles.container}>
            <Text style={commonStyles.title}>HOŞGELDİNİZ</Text>
            <Text style={commonStyles.desc}>Devam etmek için bir seçenek seçin:</Text>

            <TouchableOpacity style={commonStyles.btnPrimary} onPress={() => router.push('/choose-child')}>
                <Text style={commonStyles.btnPrimaryText}>👶 Çocuk Seçme</Text>
            </TouchableOpacity>

            <TouchableOpacity style={commonStyles.btnOutline} onPress={() => router.push('/onboarding/add-child')}>
                <Text style={commonStyles.btnOutlineText}>➕ Çocuk Ekleme</Text>
            </TouchableOpacity>
        </View>
    );
}

