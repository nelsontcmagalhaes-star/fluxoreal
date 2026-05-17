import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, AlertCircle } from "lucide-react";

type Mode = "signin" | "signup";

export default function AuthRouter() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fn = mode === "signin" ? signIn : signUp;
      const { error: err } = await fn(email, password);
      if (err) setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">FluxoReal</h1>
          <p className="text-xs text-muted-foreground">Controle financeiro inteligente</p>
        </div>
      </div>

      {/* Card */}
      <div className="card-surface w-full max-w-sm p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">
            {mode === "signin" ? "Entrar na conta" : "Criar conta"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Acesse seu painel financeiro"
              : "Comece gratuitamente hoje"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="text-center text-sm">
          {mode === "signin" ? (
            <>
              Não tem conta?{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setMode("signup")}
              >
                Criar agora
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setMode("signin")}
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
