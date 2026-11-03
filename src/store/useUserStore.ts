import { create } from "zustand";

export interface TitlePageDefaults {
  university: string;
  faculty: string;
  department: string;
  specialty: string;
  city: string;
  course: string;
  group: string;
  studentName: string;
  supervisor: string;
}

export interface ReferralStat {
  id: string;
  date: string;
  friendName: string;
  docTitle: string;
  rewardCredits: number;
  status: "completed" | "pending";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  referralCode: string;
  referralClicks: number;
  referralSignups: number;
  referralWorksGenerated: number;
  referralEarnedCredits: number;
  referrals: ReferralStat[];
  linkedAccounts: {
    yandex: boolean;
    google: boolean;
    telegram: boolean;
  };
  titleDefaults: TitlePageDefaults;
}

interface UserState {
  user: UserProfile;
  deductCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateTitleDefaults: (patch: Partial<TitlePageDefaults>) => void;
  toggleLinkedAccount: (provider: "yandex" | "google" | "telegram") => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: {
    id: "", name: "", email: "", credits: 0, referralCode: "",
    referralClicks: 0, referralSignups: 0, referralWorksGenerated: 0,
    referralEarnedCredits: 0, referrals: [],
    linkedAccounts: { yandex: false, google: false, telegram: false },
    titleDefaults: { university: "", faculty: "", department: "", specialty: "", city: "", course: "", group: "", studentName: "", supervisor: "" },
  },

  deductCredits: (amount: number) => {
    const current = get().user.credits;
    if (current < amount) return false;
    set((state) => ({
      user: {
        ...state.user,
        credits: state.user.credits - amount,
      },
    }));
    return true;
  },

  addCredits: (amount: number) => {
    set((state) => ({
      user: {
        ...state.user,
        credits: state.user.credits + amount,
      },
    }));
  },

  updateProfile: (patch) => {
    set((state) => ({
      user: {
        ...state.user,
        ...patch,
      },
    }));
  },

  updateTitleDefaults: (patch) => {
    set((state) => ({
      user: {
        ...state.user,
        titleDefaults: {
          ...state.user.titleDefaults,
          ...patch,
        },
      },
    }));
  },

  toggleLinkedAccount: (provider) => {
    set((state) => ({
      user: {
        ...state.user,
        linkedAccounts: {
          ...state.user.linkedAccounts,
          [provider]: !state.user.linkedAccounts[provider],
        },
      },
    }));
  },
}));
