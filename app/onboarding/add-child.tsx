import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { addChild } from '../../services/children';
import { router } from 'expo-router';

export default function AddChild() {
    const [name, setName] = useState('');
    const [birthdate, setBirthdate] = useState(''); // YYYY-MM-DD
    const [gender, setGender] = useState('');

    const onSave = async () => {
        try {
            await addChild({ name: name.trim(), birthdate: birthdate.trim() || undefined, gender: gender.trim() || undefined });
            Alert.alert('Başarılı', 'Çocuk eklendi.');
            router.replace('/choose-child');
        } catch (e:any) {
            Alert.alert('Hata', e.message ?? 'Kaydedilemedi.');
        }
    };

    return (
        <View style={{ flex:1, padding:16, gap:12 }}>
            <Text style={{ fontSize:20, fontWeight:'700' }}>Çocuk Ekle</Text>

            <Text>İsim *</Text>
            <TextInput
                placeholder="Örn: Elif"
                value={name}
                onChangeText={setName}
                style={{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, padding:12 }}
            />

            <Text>Doğum Tarihi (YYYY-MM-DD)</Text>
            <TextInput
                placeholder="2021-05-17"
                value={birthdate}
                onChangeText={setBirthdate}
                style={{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, padding:12 }}
            />

            <Text>Cinsiyet</Text>
            <TextInput
                placeholder="Kız/Erkek"
                value={gender}
                onChangeText={setGender}
                style={{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, padding:12 }}
            />

            <TouchableOpacity
                onPress={onSave}
                style={{ backgroundColor:'#111827', padding:14, borderRadius:12, marginTop:8 }}
            >
                <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>Kaydet</Text>
            </TouchableOpacity>
        </View>
    );
}
