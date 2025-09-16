import React from 'react';
import { ScrollView, View, Text, StyleSheet, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import CardButton from '../../components/ui/CardButton';

export default function HomeScreen() {
    const cards = [
        { id: '1', title: 'Hastalıklar', subtitle: 'Geçmiş: Grip', details: 'Grip → 3 gün sürdü, ilaçla geçti.' },
        { id: '2', title: 'Kan Değerleri', subtitle: 'Son test: Normal', details: 'Hemoglobin: 12.1 g/dL\nVitamin D: 28 ng/mL' },
        { id: '3', title: 'Aşılar', subtitle: 'Takip güncel', details: 'Son aşı: 20 Ağustos 2025, KPA-2' },
        { id: '4', title: 'Kilo', subtitle: 'Son ölçüm: 18kg', details: 'Boy: 105cm, Percentile ~60' },
    ];

    return (
        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 30 }}>
            <Text style={styles.sectionTitle}>Anasayfa</Text>

            {/* üstte kartlar */}
            <FlatList
                data={cards}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CardButton title={item.title} subtitle={item.subtitle} details={item.details} />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />

            {/* takvim */}
            <Text style={styles.sectionTitle}>Takvim</Text>
            <View style={styles.calendarWrap}>
                <Calendar
                    current={'2025-09-15'}
                    markedDates={{
                        '2025-09-15': { selected: true, selectedColor: '#3b82f6' },
                    }}
                    theme={{
                        backgroundColor: '#fff',
                        calendarBackground: '#fff',
                        selectedDayBackgroundColor: '#3b82f6',
                        selectedDayTextColor: '#fff',
                        todayTextColor: '#3b82f6',
                        arrowColor: '#3b82f6',
                        monthTextColor: '#111827',
                    }}
                />
            </View>

            {/* sağlık özeti */}
            <Text style={styles.sectionTitle}>Sağlık Özeti</Text>
            <View style={{ paddingHorizontal: 16 }}>
                <CardButton
                    title="Genel Durum"
                    subtitle="Son kontrol: Normal"
                    details="Çocuğun genel sağlık durumu iyi 👍
Kilo ve boy gelişimi percentile aralığında.
Aşı takvimi güncel."
                    variant="full"
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#0f172a' },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginVertical: 12, marginLeft: 16 },
    calendarWrap: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 16,
        padding: 8,
        elevation: 3,
    },
});
