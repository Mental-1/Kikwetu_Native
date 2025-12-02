import { authService } from "@/src/services/auth.service";
import { AuthUser } from "@/src/types/api.types";
import {
  clearTokens,
  getAccessToken,
  getUserData,
  isAuthenticated,
  isTokenExpired,
  setTokens,
  setUserData,
} from "@/src/utils/tokenManager";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    username: string,
    fullName?: string,
    phoneNumber?: string,
  ) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshUserSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.getSession();
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        await clearTokens();
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      await clearTokens();
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const cachedUser = await getUserData();
        if (cachedUser && isMounted) {
          setUser(cachedUser);
        }

        const authenticated = await isAuthenticated();

        if (authenticated) {
          const token = await getAccessToken();
          if (token && isTokenExpired(token)) {
            const refreshed = await refreshUserSession();
            if (!refreshed && isMounted) {
              setUser(null);
            }
          } else if (isMounted && !cachedUser) {
            await refreshUserSession();
          }
        } else if (isMounted) {
          await clearTokens();
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshUserSession]);

  /**
   * Sign in
   * @param email
   * @param password
   * @returns
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        return { error: null };
      }

      return {
        error: {
          message: response.error || response.message || "Login failed",
        },
      };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { error: { message: error.message || "Login failed" } };
    } finally {
      setLoading(false);
    }
  }, []);
/**
 * Sign up
 * @param email
 * @param password
 * @param username
 * @param fullName
 * @param phoneNumber
 * @returns
 */
  const signUp = useCallback(async (
    email: string,
    password: string,
    username: string,
    fullName?: string,
    phoneNumber?: string,
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
        return { error: null };
      }

      return {
        error: {
          message: response.error || response.message || "Registration failed",
        },
      };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return { error: { message: error.message || "Registration failed" } };
    } finally {
      setLoading(false);
    }
  }, []);
/**
 * Sign out
 * @returns
 */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      return { error: null };
    } catch (error: any) {
      console.error("Sign out error:", error);
      await clearTokens();
      setUser(null);
      return { error: null };
    } finally {
      setLoading(false);
    }
  }, []);
/**
 * Reset password
 * @param email
 * @returns
 */
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);

      if (response.success) {
        return { error: null };
      }

      return {
        error: {
          message: response.error || response.message ||
            "Password reset failed",
        },
      };
    } catch (error: any) {
      console.error("Reset password error:", error);
      return { error: { message: error.message || "Password reset failed" } };
    } finally {
      setLoading(false);
    }
  }, []);
/**
 * Refreshes the user session
 */
  const refreshUser = useCallback(async (): Promise<boolean> => {
    return await refreshUserSession();
  }, [refreshUserSession]);

  const value: AuthContextType = {
    user,
    loading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
