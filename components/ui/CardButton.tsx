import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    title: string;
    subtitle: string;
    details: string;
    variant?: 'default' | 'full'; // normal kart ya da tam genişlik sağlık özeti
};

export default function CardButton({ title, subtitle, details, variant = 'default' }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Pressable
                onPress={() => setOpen(true)}
                style={[
                    styles.card,
                    variant === 'full' && styles.fullCard, // sağlık özeti için özel stil
                ]}
            >
                {/* süs daireler */}
                <View style={[styles.circle, { backgroundColor: '#312e81', top: -50, right: -30 }]} />
                <View style={[styles.circle, { backgroundColor: '#4f46e5', top: -80, right: -40 }]} />

                <View style={{ zIndex: 2 }}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>

                <Pressable style={styles.menuBtn} onPress={() => setOpen(true)}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </Pressable>
            </Pressable>

            {/* detay modal */}
            <Modal visible={open} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{title} Detay</Text>
                        <Text style={styles.modalText}>{details}</Text> {/*} card buton advice yazıyor */}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 200,
        height: 120,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        backgroundColor: '#1e3a8a', // ana kart rengi (koyu mavi)
        // gölge
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    fullCard: {
        width: '100%',
        height: 160,
        marginRight: 0,
        marginTop: 12,
    },
    circle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.25,
    },
    menuBtn: { position: 'absolute', top: 10, right: 10, zIndex: 3 },
    title: { fontSize: 18, fontWeight: '700', color: '#fff' },
    subtitle: { fontSize: 14, color: '#c7d2fe', marginTop: 2 }, // açık mor-mavi
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },
    closeBtn: { position: 'absolute', top: 10, right: 10 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    modalText: { fontSize: 14, color: '#333' },
});
