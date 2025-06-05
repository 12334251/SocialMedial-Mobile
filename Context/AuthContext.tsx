/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";
import { setLogin } from "../redux/state";

type DecodedToken = { exp: number };

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  picturePath: string;
  friends: { [key: string]: string };
  location: string;
  occupation: string;
  createdAt: string;
  // …any other fields your backend returns
}

interface AuthContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  initialUser: User | null;
  children: ReactNode;
}

export const AuthProvider = ({ initialUser, children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(initialUser);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    setUser(initialUser);
    dispatch(setLogin(initialUser));
  }, [initialUser]);

  // On mount, fetch the auth token (and schedule refresh)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function fetchToken() {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        setAuthToken(token);

        // peek at expiration to schedule refresh
        if (token) {
          const { exp } = jwtDecode<DecodedToken>(token);
          const msUntilExpiry = exp * 1000 - Date.now() - 5000;
          timeoutId = setTimeout(fetchToken, msUntilExpiry);
        }
      } catch (err) {
        // any error → logout
        router.push("/");
      }
    }

    fetchToken();
    return () => clearTimeout(timeoutId);
  }, [router]);

  const logout = () => {
    // clear local state and redirect
    setUser(null);
    setAuthToken(null);
    router.push("/");
  };

  const value = useMemo(
    () => ({
      user,
      authToken,
      setAuthToken,
      setUser,
      logout,
    }),
    [user, authToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
