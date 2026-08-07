import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  credits: number;
  isPro: boolean;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  updateCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: {
    id: "usr_2026_demo",
    email: "ivan.student@vuz.ru",
    fullName: "Иван Иванов",
    credits: 15,
    isPro: true,
  },
  isAuthenticated: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  updateCredits: (amount) => {
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          credits: state.user.credits + amount,
        },
      };
    });
  },

  deductCredits: (amount) => {
    const { user } = get();
    if (!user || user.credits < amount) {
      return false;
    }
    set({
      user: {
        ...user,
        credits: user.credits - amount,
      },
    });
    return true;
  },

  logout: () => set({ user: null, isAuthenticated: false }),
}));
