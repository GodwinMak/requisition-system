import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService, User } from '../services/userService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        setToken(savedToken);
        userService.setToken(savedToken);
        try {
          const profile = await userService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to fetch profile during init:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    userService.setToken(newToken);
    try {
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (error: any) {
      console.error('Login failed during profile fetch:', error);
      logout();
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    userService.setToken(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
