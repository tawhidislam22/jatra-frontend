"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { User } from "@/types/jatra";
import { clearClientAuthToken, getClientAuthToken, setClientAuthToken } from "@/lib/auth-cookies";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  refetchUser: async () => {},
});

export const CURRENT_USER_QUERY_KEY = ["currentUser"];

function decodeClientJwt(token: string): User | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    const displayName = payload.fullName || payload.name || payload.email?.split('@')[0] || 'User';
    return {
      id: payload.userId || payload.id,
      fullName: displayName,
      name: displayName,
      email: payload.email || '',
      phone: payload.phone || '',
      role: payload.role || 'CUSTOMER',
      status: payload.status || 'ACTIVE',
      image: payload.image,
      managedCenter: payload.managedCenter,
      employedAtCenterId: payload.employedAtCenterId,
      employedAtCenter: payload.employedAtCenter,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const token = getClientAuthToken();
      if (!token) return null;
      try {
        const response = await authService.getMe();
        if (response?.data?.accessToken) {
          setClientAuthToken(response.data.accessToken);
        }
        const data = response?.data;
        if (!data) return null;
        const displayName = data.fullName || data.name || data.email?.split('@')[0] || 'User';
        return {
          ...data,
          fullName: displayName,
          name: displayName,
          role: data.role || 'CUSTOMER',
        };
      } catch (err: any) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          clearClientAuthToken();
          return null;
        }
        return null;
      }
    },
    initialData: initialUser || undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes cache freshness
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false, // Prevents slow refetching and loading flicker on tab switch
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  // After hydration: if initialUser wasn't available from SSR, decode client token immediately
  useEffect(() => {
    if (!initialUser) {
      const token = getClientAuthToken();
      if (token) {
        const decoded = decodeClientJwt(token);
        if (decoded) {
          queryClient.setQueryData(CURRENT_USER_QUERY_KEY, (old: any) => old || decoded);
        }
      }
    }
  }, [initialUser, queryClient]);

  // Listen to cross-tab / client login/logout events to update cache
  useEffect(() => {
    const handleStorageChange = () => {
      const token = getClientAuthToken();
      if (!token) {
        queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
      } else {
        queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [queryClient]);

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      clearClientAuthToken();
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
      queryClient.clear();
      router.push("/login");
    }
  };

  const role = user?.role || null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        role,
        isLoading: isLoading && user === undefined,
        isAuthenticated,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
