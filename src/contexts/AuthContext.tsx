import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isDemo: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY);

// Lazy Supabase client – only created if env vars are present
let supabase: any = null;
if (isSupabaseConfigured) {
  import("@supabase/supabase-js").then(({ createClient }) => {
    supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode: treat as signed-in demo user
      setUser({ id: "demo", email: "demo@fluxoreal.app" });
      setLoading(false);
      return;
    }

    // Wait until supabase client is ready
    const init = async () => {
      const { createClient } = await import("@supabase/supabase-js");
      supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" });
      }
      setLoading(false);

      supabase.auth.onAuthStateChange((_: any, session: any) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? "" });
        } else {
          setUser(null);
        }
      });
    };
    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setUser({ id: "demo", email });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setUser({ id: "demo", email });
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isDemo: !isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
