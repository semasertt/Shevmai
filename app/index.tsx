import { Redirect } from 'expo-router';
import { useAppStore } from '../lib/store';

export default function Index() {
    const onboarded = useAppStore((s) => s.onboarded);
    if (!onboarded) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)/home" />;
}
