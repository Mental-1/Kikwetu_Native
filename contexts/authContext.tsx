import { authService } from '@/src/services/auth.service';
import { AuthUser } from '@/src/types/api.types';
import { clearTokens, getUserData, isAuthenticated, setUserData } from '@/src/utils/tokenManager';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const initializeAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        
        if (authenticated) {
          // Get user data from secure storage
          const userData = await getUserData();
          if (userData) {
            setUser(userData);
          } else {
            // Fetch fresh user data from API
            await refreshUserSession();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Refresh user session from API
   */
  const refreshUserSession = async () => {
    try {
      const response = await authService.getSession();
      if (response.success && response.data) {
        setUser(response.data.user);
        await setUserData(response.data.user);
      } else {
        // Token invalid, clear everything
        await clearTokens();
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      await clearTokens();
      setUser(null);
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        return { error: null };
      }

      return { error: { message: response.error || 'Login failed' } };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: { message: error.message || 'Login failed' } };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up new user
   */
  const signUp = async (
    email: string,
    password: string,
    username: string,
    fullName?: string
  ) => {
    try {
      setLoading(true);
      const response = await authService.register({
        email,
        password,
        username,
        full_name: fullName,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        return { error: null };
      }

      return { error: { message: response.error || 'Registration failed' } };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: { message: error.message || 'Registration failed' } };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out user
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Clear local state even if API call fails
      setUser(null);
      await clearTokens();
      return { error: { message: error.message || 'Logout failed' } };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        return { error: null };
      }

      return { error: { message: response.error || 'Password reset failed' } };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: { message: error.message || 'Password reset failed' } };
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    await refreshUserSession();
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};