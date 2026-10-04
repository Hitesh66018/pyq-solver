"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];
type User = NonNullable<Session>["user"];
type PasswordResult = Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
type SignUpResult = Awaited<ReturnType<typeof supabase.auth.signUp>>;
type OAuthResult = Awaited<ReturnType<typeof supabase.auth.signInWithOAuth>>;
type SignOutResult = Awaited<ReturnType<typeof supabase.auth.signOut>>;

interface AuthContextValue {
  user: User | null;
  session: Session;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithPassword: (email: string, password: string) => Promise<PasswordResult>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<SignOutResult>;
  signInWithOAuth: (provider: Provider) => Promise<OAuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    void supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (isMounted) {
          setSession(currentSession);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false),
    signInWithPassword: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
    signInWithOAuth: (provider) =>
      supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}