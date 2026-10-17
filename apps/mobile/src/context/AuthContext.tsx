import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, UserProfile } from '../services/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, tenantId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchUserRole: (role: 'TEACHER' | 'STUDENT') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => apiClient.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const existing = apiClient.getCurrentUser();
    if (existing) {
      setUser(existing);
    }
  }, []);

  const signIn = async (email: string, password: string, tenantId?: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.signIn(email, password, tenantId);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await apiClient.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchUserRole = (role: 'TEACHER' | 'STUDENT') => {
    if (user) {
      const updated: UserProfile = { ...user, role };
      setUser(updated);
      apiClient.setTokens(apiClient.getAccessToken(), apiClient.getRefreshToken(), updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

