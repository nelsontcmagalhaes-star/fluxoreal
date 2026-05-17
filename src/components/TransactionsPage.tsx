import { useState } from "react";
import { CATEGORY_META, type Transaction, type CreditCard, type Category } from "@/hooks/useTransactions";
import MonthYearNavigator from "@/components/MonthYearNavigator";
import AddTransactionDrawer from "@/components/AddTransactionDrawer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  monthTxs: Transaction[];
  cards: CreditCard[];
  activeCardId: string;
  setActiveCardId: (id: string) => void;
  totalSpent: number;
  addTransaction: (tx: Omit<Transaction, "id" | "cardId">) => void;
  removeTransaction: (id: string) => void;
  navMonth: number;
  navYear: number;
  setNavMonth: (m: number) => void;
  setNavYear: (y: number) => void;
};

export default function TransactionsPage(props: Props) {
  const {
    monthTxs, cards, activeCardId, setActiveCardId, totalSpent,
    addTransaction, removeTransaction,
    navMonth, navYear, setNavMonth, setNavYear,
  } = props;

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<Category | "">("");

  const filtered = monthTxs.filter(tx => {
    const matchSearch = !search ||
      tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || tx.category === filterCat;
    return matchSearch && matchCat;
  });

  const allCategories = Array.from(new Set(monthTxs.map(t => t.category)));

  return (
    <div className="px-4 pt-6 pb-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="micro-label">Gastos no Cartão</p>
          <h1 className="text-xl font-bold">Transações</h1>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearNavigator navMonth={navMonth} navYear={navYear} setNavMonth={setNavMonth} setNavYear={setNavYear} />
          <AddTransactionDrawer onAdd={addTransaction} />
        </div>
      </div>

      {/* Card selector */}
      {cards.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => setActiveCardId(card.id)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                activeCardId === card.id
                  ? "bg-primary text-white border-primary"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              {card.name} ••{card.lastFourDigits}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="card-surface p-4 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{filtered.length} transação(ões)</span>
        <span className="font-bold text-destructive">{fmt(totalSpent)}</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category filters */}
      {allCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat("")}
            className={cn(
              "shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
              !filterCat ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground"
            )}
          >
            Todos
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? "" : cat)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                filterCat === cat ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground"
              )}
            >
              {CATEGORY_META[cat]?.icon} {cat}
            </button>
          ))}
        </div>
      )}

      {/* Transaction list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">🧾</p>
            <p className="font-medium">Nenhuma transação encontrada</p>
            <p className="text-sm">Toque em + para adicionar</p>
          </div>
        ) : (
          filtered.map(tx => {
            const meta = CATEGORY_META[tx.category] ?? { icon: "📦", bg: "hsl(220 10% 97%)" };
            return (
              <div key={tx.id} className="card-surface p-4 flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: meta.bg }}
                >
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{tx.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category}
                    {tx.installments > 1 && (
                      <Badge variant="secondary" className="ml-2 text-[10px] py-0">
                        {tx.currentInstallment}/{tx.installments}x
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-destructive tabular">{fmt(tx.amount)}</span>
                  <button
                    onClick={() => removeTransaction(tx.id)}
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
