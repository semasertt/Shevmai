import { create } from 'zustand';

type Child = { id: string; name: string };

type AppState = {
    onboarded: boolean;
    setOnboarded: (v: boolean) => void;

    children: Child[];
    addChild: (name: string) => void;

    activeChildId?: string;
    setActiveChild: (id?: string) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
    onboarded: false,
    setOnboarded: (v) => set({ onboarded: v }),

    children: [], // başlangıçta boş
    addChild: (name) => {
        const id = Math.random().toString(36).slice(2, 9);
        const newChild = { id, name: name.trim() || 'İsimsiz' };
        set({ children: [...get().children, newChild], activeChildId: id });
    },

    activeChildId: undefined,
    setActiveChild: (id) => set({ activeChildId: id }),
}));
