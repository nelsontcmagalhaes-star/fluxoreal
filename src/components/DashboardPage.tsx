import { useAuth } from "@/contexts/AuthContext";
import { CATEGORY_META, type Transaction, type CreditCard } from "@/hooks/useTransactions";
import { type Income } from "@/hooks/useIncome";
import MonthYearNavigator from "@/components/MonthYearNavigator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, CreditCard as CreditCardIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  // transactions hook
  monthTxs: Transaction[];
  card: CreditCard | null;
  totalSpent: number;
  availableLimit: number;
  usedPercent: number;
  categorySorted: [string, number][];
  top5: Transaction[];
  // income hook
  monthIncomes: Income[];
  totalIncome: number;
  // fixed hook
  totalFixed: number;
  totalPending: number;
  // nav
  navMonth: number;
  navYear: number;
  setNavMonth: (m: number) => void;
  setNavYear: (y: number) => void;
  onTabChange: (tab: any) => void;
};

export default function DashboardPage(props: Props) {
  const {
    monthTxs, card, totalSpent, availableLimit, usedPercent,
    categorySorted, top5,
    totalIncome, totalFixed, totalPending,
    navMonth, navYear, setNavMonth, setNavYear,
    onTabChange,
  } = props;

  const { signOut, user } = useAuth();
  const balance = totalIncome - totalSpent - totalFixed;

  return (
    <div className="px-4 pt-6 pb-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="micro-label">Bem-vindo</p>
          <h1 className="text-xl font-bold">{user?.email?.split("@")[0] ?? "Usuário"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearNavigator navMonth={navMonth} navYear={navYear} setNavMonth={setNavMonth} setNavYear={setNavYear} />
          <button
            onClick={signOut}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Balance summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-surface p-3 space-y-1">
          <p className="micro-label flex items-center gap-1"><TrendingUp size={10} className="text-success" /> Receitas</p>
          <p className="text-sm font-bold text-success tabular">{fmt(totalIncome)}</p>
        </div>
        <div className="card-surface p-3 space-y-1">
          <p className="micro-label flex items-center gap-1"><TrendingDown size={10} className="text-destructive" /> Gastos</p>
          <p className="text-sm font-bold text-destructive tabular">{fmt(totalSpent)}</p>
        </div>
        <div className="card-surface p-3 space-y-1">
          <p className="micro-label flex items-center gap-1"><Wallet size={10} /> Saldo</p>
          <p className={cn("text-sm font-bold tabular", balance >= 0 ? "text-success" : "text-destructive")}>
            {fmt(balance)}
          </p>
        </div>
      </div>

      {/* Credit card usage */}
      {card ? (
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCardIcon size={18} className="text-primary" />
              <div>
                <p className="font-semibold text-sm">{card.name}</p>
                <p className="micro-label">{card.bank} •••• {card.lastFourDigits}</p>
              </div>
            </div>
            <Badge variant={usedPercent > 80 ? "destructive" : "secondary"}>
              {usedPercent.toFixed(0)}% usado
            </Badge>
          </div>
          <Progress value={usedPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Gasto: <span className="font-semibold text-foreground">{fmt(totalSpent)}</span></span>
            <span>Disponível: <span className="font-semibold text-foreground">{fmt(availableLimit)}</span></span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => onTabChange("card")}
          className="card-surface p-4 w-full flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
        >
          <CreditCardIcon size={20} className="text-primary" />
          <div>
            <p className="font-semibold text-sm">Nenhum cartão cadastrado</p>
            <p className="text-xs text-muted-foreground">Toque para adicionar seu primeiro cartão</p>
          </div>
        </button>
      )}

      {/* Fixed expenses summary */}
      {totalFixed > 0 && (
        <div className="card-surface p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="micro-label">Despesas Fixas</p>
            <button className="text-xs text-primary font-medium" onClick={() => onTabChange("fixed")}>ver todas</button>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total do mês</span>
            <span className="font-bold">{fmt(totalFixed)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Pendentes</span>
            <span className={cn("font-semibold", totalPending > 0 ? "text-destructive" : "text-success")}>
              {fmt(totalPending)}
            </span>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {categorySorted.length > 0 && (
        <div className="card-surface p-4 space-y-3">
          <p className="micro-label">Gastos por Categoria</p>
          {categorySorted.slice(0, 5).map(([cat, val]) => {
            const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META] ?? { icon: "📦", bg: "hsl(220 10% 97%)" };
            const pct = totalSpent > 0 ? (val / totalSpent) * 100 : 0;
            return (
              <div key={cat} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: meta.bg }}
                >
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{cat}</span>
                    <span className="text-muted-foreground">{fmt(val)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top 5 transactions */}
      {top5.length > 0 && (
        <div className="card-surface p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="micro-label">Maiores Gastos</p>
            <button className="text-xs text-primary font-medium" onClick={() => onTabChange("transactions")}>ver todos</button>
          </div>
          {top5.map(tx => {
            const meta = CATEGORY_META[tx.category] ?? { icon: "📦", bg: "hsl(220 10% 97%)" };
            return (
              <div key={tx.id} className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: meta.bg }}
                >
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.merchant}</p>
                  <p className="text-xs text-muted-foreground">{tx.category}</p>
                </div>
                <span className="text-sm font-bold text-destructive tabular shrink-0">{fmt(tx.amount)}</span>
              </div>
            );
          })}
        </div>
      )}

      {monthTxs.length === 0 && totalIncome === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium">Nenhum dado este mês</p>
          <p className="text-sm">Adicione transações e receitas para ver o resumo</p>
        </div>
      )}
    </div>
  );
}
