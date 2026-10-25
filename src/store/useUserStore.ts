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
    id: "usr_7890",
    name: "Иван Иванов",
    email: "ivan.student@vuz.ru",
    credits: 25,
    referralCode: "GOST-IVAN77",
    referralClicks: 142,
    referralSignups: 18,
    referralWorksGenerated: 12,
    referralEarnedCredits: 60,
    referrals: [
      {
        id: "ref_1",
        date: "23 окт 2026",
        friendName: "Дмитрий С.",
        docTitle: "Курсовая по банковскому праву",
        rewardCredits: 5,
        status: "completed",
      },
      {
        id: "ref_2",
        date: "20 окт 2026",
        friendName: "Алина М.",
        docTitle: "ВКР по маркетингу в ритейле",
        rewardCredits: 10,
        status: "completed",
      },
      {
        id: "ref_3",
        date: "17 окт 2026",
        friendName: "Сергей К.",
        docTitle: "Реферат по криптографии",
        rewardCredits: 5,
        status: "completed",
      },
    ],
    linkedAccounts: {
      yandex: true,
      google: true,
      telegram: false,
    },
    titleDefaults: {
      university: "Московский государственный университет им. М.В. Ломоносова",
      faculty: "Факультет вычислительной математики и кибернетики",
      department: "Кафедра системного анализа",
      specialty: "09.03.04 Программная инженерия",
      city: "Москва",
      course: "3 курс",
      group: "ПИ-301",
      studentName: "Иванов Иван Иванович",
      supervisor: "доцент, к.т.н. Смирнов А. В.",
    },
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
