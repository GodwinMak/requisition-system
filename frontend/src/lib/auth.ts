import { User } from '../types';

const TOKEN_KEY = 'ia_token';
const USER_KEY = 'ia_user';

export const authHelper = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  setUser: (user: any) => {
    // Normalize _id to id if necessary
    const normalizedUser = {
      ...user,
      id: user.id || user._id || user.uid
    };
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
  isAdmin: () => {
    const user = authHelper.getUser();
    return user?.role === 'admin';
  }
};
