import { useState } from "react";
import { INCOME_CATEGORY_META, type Income, type IncomeCategory } from "@/hooks/useIncome";
import MonthYearNavigator from "@/components/MonthYearNavigator";
import AddIncomeDrawer from "@/components/AddIncomeDrawer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  monthIncomes: Income[];
  totalIncome: number;
  categorySorted: [string, number][];
  addIncome: (inc: Omit<Income, "id">) => void;
  removeIncome: (id: string) => void;
  updateIncome: (data: Income) => void;
  navMonth: number;
  navYear: number;
  setNavMonth: (m: number) => void;
  setNavYear: (y: number) => void;
};

export default function IncomePage(props: Props) {
  const {
    monthIncomes, totalIncome, categorySorted,
    addIncome, removeIncome,
    navMonth, navYear, setNavMonth, setNavYear,
  } = props;

  const [search, setSearch] = useState("");

  const filtered = monthIncomes.filter(inc =>
    !search ||
    inc.source.toLowerCase().includes(search.toLowerCase()) ||
    inc.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-6 pb-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="micro-label">Entradas do Mês</p>
          <h1 className="text-xl font-bold">Receitas</h1>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearNavigator navMonth={navMonth} navYear={navYear} setNavMonth={setNavMonth} setNavYear={setNavYear} />
          <AddIncomeDrawer onAdd={addIncome} />
        </div>
      </div>

      {/* Total summary */}
      <div className="card-surface p-4">
        <p className="micro-label mb-1">Total recebido</p>
        <p className="text-2xl font-bold text-success tabular">{fmt(totalIncome)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{monthIncomes.length} entrada(s) registrada(s)</p>
      </div>

      {/* Category breakdown */}
      {categorySorted.length > 0 && (
        <div className="card-surface p-4 space-y-3">
          <p className="micro-label">Por Categoria</p>
          {categorySorted.map(([cat, val]) => {
            const meta = INCOME_CATEGORY_META[cat as IncomeCategory] ?? { icon: "💰", bg: "hsl(220 10% 97%)" };
            const pct = totalIncome > 0 ? (val / totalIncome) * 100 : 0;
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
                    <div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar receitas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Income list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">💰</p>
            <p className="font-medium">Nenhuma receita este mês</p>
            <p className="text-sm">Toque em + para adicionar</p>
          </div>
        ) : (
          filtered.map(inc => {
            const meta = INCOME_CATEGORY_META[inc.category] ?? { icon: "💰", bg: "hsl(220 10% 97%)" };
            return (
              <div key={inc.id} className="card-surface p-4 flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: meta.bg }}
                >
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{inc.source}</p>
                    {inc.recurrent && (
                      <RefreshCw size={12} className="text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{inc.category} · {inc.date}</p>
                  {inc.description && (
                    <p className="text-xs text-muted-foreground truncate">{inc.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-success tabular">{fmt(inc.amount)}</span>
                  <button
                    onClick={() => removeIncome(inc.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
