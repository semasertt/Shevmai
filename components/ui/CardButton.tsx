import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    title: string;
    subtitle: string;
    details: string;
    imageUrl?: string;   // ✅ yeni eklendi
    variant?: 'default' | 'full';
};

export default function CardButton({ title, subtitle, details, imageUrl, variant = 'default' }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Pressable
                onPress={() => setOpen(true)}
                style={[
                    styles.card,
                    variant === 'full' && styles.fullCard,
                ]}
            >
                {/* süs daireler */}
                <View style={[styles.circle, { backgroundColor: '#312e81', top: -50, right: -30 }]} />
                <View style={[styles.circle, { backgroundColor: '#4f46e5', top: -80, right: -40 }]} />

                <View style={{ zIndex: 2 }}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {/* ✅ küçük resim ekle */}
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.cardImage}
                        />
                    ) : null}
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
                        <Text style={styles.modalText}>{details}</Text>

                        {/* ✅ modalda büyük resim */}
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.modalImage}
                            />
                        ) : null}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 200,
        height: 140, // ✅ biraz büyüttüm ki resim sığsın
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        backgroundColor: '#1e3a8a',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    fullCard: {
        width: '100%',
        height: 180,
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
    subtitle: { fontSize: 14, color: '#c7d2fe', marginTop: 2 },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginTop: 8,
    },
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
    modalText: { fontSize: 14, color: '#333', marginBottom: 12 },
    modalImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        marginTop: 8,
    },
});
