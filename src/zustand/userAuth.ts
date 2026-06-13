import { create } from "zustand";

interface UserAuthState {
  loading: boolean;

  setLoading: (value: boolean) => void;
}

export const useUserAuth = create<UserAuthState>((set) => ({
  loading: false,

  setLoading: (value) =>
    set({
      loading: value,
    }),
}));
