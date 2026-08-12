import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "provider" | "customer";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  status: AuthStatus;
  emailVerified: boolean;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as AppRole) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession?.user) {
        setRole(null);
        setStatus("unauthenticated");
        return;
      }
      // Defer the database read out of the auth callback to avoid deadlocks.
      setTimeout(() => {
        void fetchRole(nextSession.user.id).then((nextRole) => {
          if (!active) return;
          setRole(nextRole);
          setStatus("authenticated");
        });
      }, 0);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      role,
      status,
      emailVerified: Boolean(user?.email_confirmed_at),
      refreshRole: async () => {
        if (user) setRole(await fetchRole(user.id));
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
        setStatus("unauthenticated");
      },
    }),
    [user, session, role, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
