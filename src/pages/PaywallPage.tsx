import { Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaywallPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-10 h-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Limite do período gratuito</h2>
        <p className="text-muted-foreground max-w-xs">
          Você atingiu o limite de 3 transações do período de avaliação. Assine o FluxoReal Pro para acesso ilimitado.
        </p>
      </div>

      <div className="card-surface w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-medium">Transações ilimitadas</span>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-medium">Múltiplos cartões</span>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-medium">Controle de despesas fixas</span>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-medium">Gestão de empresas e REFIS</span>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-medium">Relatórios detalhados</span>
        </div>
      </div>

      <div className="space-y-3 w-full max-w-sm">
        <Button className="w-full" size="lg">
          Assinar FluxoReal Pro — R$ 9,90/mês
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground">
          Continuar no plano gratuito
        </Button>
      </div>
    </div>
  );
}
