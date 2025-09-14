import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { fetchChildren, getSelectedChild } from '../services/children';

export default function Index() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const children = await fetchChildren();
                if (!children || children.length === 0) {
                    router.replace('/onboarding/add-child');
                    return;
                }
                const selected = await getSelectedChild();
                if (selected && children.find(c => c.id === selected)) {
                    router.replace('/(tabs)/home');
                } else {
                    router.replace('/choose-child');
                }
            } catch {
                router.replace('/onboarding/add-child');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <View style={{ flex: 1, alignItems:'center', justifyContent:'center' }}>
            <ActivityIndicator />
        </View>;
    }
    return null;
}
