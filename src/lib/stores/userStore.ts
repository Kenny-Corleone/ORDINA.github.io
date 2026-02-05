import { writable } from 'svelte/store';
import type { UserProfile } from '../types';

interface UserStore {
  userId: string | null;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
}

const initialState: UserStore = {
  userId: null,
  isAuthenticated: false,
  userProfile: null,
};

function createUserStore() {
  const { subscribe, set, update } = writable<UserStore>(initialState);

  return {
    subscribe,
    setUser: (userId: string, userProfile: UserProfile) => {
      update(state => ({
        ...state,
        userId,
        isAuthenticated: true,
        userProfile,
      }));
    },
    clearUser: () => {
      set(initialState);
    },
    updateProfile: (userProfile: Partial<UserProfile>) => {
      update(state => ({
        ...state,
        userProfile: state.userProfile ? { ...state.userProfile, ...userProfile } : null,
      }));
    },
  };
}

export const userStore = createUserStore();
