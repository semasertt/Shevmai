import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function Index() {
    const [ready, setReady] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getSession();
            setLoggedIn(!!data.session);
            setReady(true);
        })();
        const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s));
        return () => sub.subscription?.unsubscribe();
    }, []);

    if (!ready) return null;
    return <Redirect href={loggedIn ? "/onboarding" : "/(auth)/sign-in"} />;

}
