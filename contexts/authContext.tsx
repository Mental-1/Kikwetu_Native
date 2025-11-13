 import { authService } from '@/src/services/auth.service';
import { AuthUser } from '@/src/types/api.types';
import { clearTokens, getUserData, isAuthenticated, setUserData } from '@/src/utils/tokenManager';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string, fullName?: string, phoneNumber?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUser: () => Promise<boolean>;
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
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (authenticated) {
          const userData = await getUserData();
          if (userData && isMounted) {
            setUser(userData);
          } else if (isMounted) {
            await refreshUserSession();
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Refresh user session from API
   */
  const refreshUserSession = async (): Promise<boolean> => {
    try {
      const response = await authService.getSession();
      if (response.success && response.data) {
        setUser(response.data.user);
        await setUserData(response.data.user);
        return true;
      } else {
        // Token invalid, clear everything
        await clearTokens();
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      await clearTokens();
      setUser(null);
      return false;
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
        await setUserData(response.data.user);
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
    fullName?: string,
    phoneNumber?: string
  ) => {
    try {
      setLoading(true);
      const response = await authService.register({
        email,
        password,
        username,
        full_name: fullName,
        phone_number: phoneNumber,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        await setUserData(response.data.user);
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
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: { message: error.message || 'Logout failed' } };
    } finally {
      await clearTokens();
      setUser(null);
      setLoading(false);
    }
    return { error: null };
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);

      if (response.success) {
        return { error: null };
      }

      return { error: { message: response.error || 'Password reset failed' } };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: { message: error.message || 'Password reset failed' } };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<boolean> => {
    return await refreshUserSession();
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