import { useState } from "react";
import { type FixedExpense } from "@/hooks/useFixedExpenses";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, RotateCcw, Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  expenses: FixedExpense[];
  totalFixed: number;
  totalPaid: number;
  totalPending: number;
  paidCount: number;
  togglePaid: (id: string) => void;
  resetMonth: () => void;
  addExpense: (data: Omit<FixedExpense, "id" | "paid">) => void;
  updateExpense: (data: FixedExpense) => void;
  removeExpense: (id: string) => void;
};

function ExpenseFormSheet({
  trigger,
  onSave,
  initial,
}: {
  trigger: React.ReactNode;
  onSave: (data: Omit<FixedExpense, "id" | "paid">) => void;
  initial?: FixedExpense;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [dueDay, setDueDay] = useState(initial ? String(initial.dueDay) : "");
  const [category, setCategory] = useState(initial?.category ?? "Casa");
  const [icon, setIcon] = useState(initial?.icon ?? "📌");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!name || isNaN(parsed) || parsed <= 0) return;
    onSave({ name, amount: parsed, dueDay: parseInt(dueDay) || 1, category, icon });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle>{initial ? "Editar Despesa" : "Nova Despesa Fixa"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSave} className="space-y-4 pb-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5 col-span-3">
              <Label>Nome *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Internet" required />
            </div>
            <div className="space-y-1.5">
              <Label>Ícone</Label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="📌" maxLength={2} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" required />
            </div>
            <div className="space-y-1.5">
              <Label>Vencimento (dia)</Label>
              <Input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Casa" />
          </div>
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function FixedExpensesPage(props: Props) {
  const { expenses, totalFixed, totalPaid, totalPending, paidCount,
    togglePaid, resetMonth, addExpense, updateExpense, removeExpense } = props;

  const paidPct = totalFixed > 0 ? (totalPaid / totalFixed) * 100 : 0;

  return (
    <div className="px-4 pt-6 pb-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="micro-label">Mensais</p>
          <h1 className="text-xl font-bold">Despesas Fixas</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
            title="Resetar mês"
          >
            <RotateCcw size={17} />
          </button>
          <ExpenseFormSheet
            trigger={
              <Button size="icon" className="rounded-full w-10 h-10 shadow-lg">
                <Plus size={20} />
              </Button>
            }
            onSave={addExpense}
          />
        </div>
      </div>

      {/* Progress summary */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{paidCount}/{expenses.length} pagas</span>
          <Badge variant={paidPct === 100 ? "default" : "secondary"}>{paidPct.toFixed(0)}%</Badge>
        </div>
        <Progress value={paidPct} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Pago: <span className="font-semibold text-success">{fmt(totalPaid)}</span></span>
          <span>Pendente: <span className={cn("font-semibold", totalPending > 0 ? "text-destructive" : "text-foreground")}>{fmt(totalPending)}</span></span>
        </div>
        <div className="text-xs text-muted-foreground text-right">Total: <span className="font-bold text-foreground">{fmt(totalFixed)}</span></div>
      </div>

      {/* Expense list */}
      <div className="space-y-2">
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">Nenhuma despesa fixa</p>
            <p className="text-sm">Toque em + para adicionar</p>
          </div>
        ) : (
          expenses
            .sort((a, b) => a.dueDay - b.dueDay)
            .map(exp => (
              <div
                key={exp.id}
                className={cn(
                  "card-surface p-4 flex items-center gap-3 transition-opacity",
                  exp.paid && "opacity-60"
                )}
              >
                <button
                  onClick={() => togglePaid(exp.id)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    exp.paid
                      ? "bg-success border-success text-white"
                      : "border-muted-foreground/40 hover:border-success"
                  )}
                >
                  {exp.paid && <Check size={14} />}
                </button>

                <span className="text-xl shrink-0">{exp.icon}</span>

                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold text-sm", exp.paid && "line-through")}>{exp.name}</p>
                  <p className="text-xs text-muted-foreground">{exp.category} · dia {exp.dueDay}</p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm tabular">{fmt(exp.amount)}</span>
                  <ExpenseFormSheet
                    trigger={
                      <button className="text-muted-foreground hover:text-primary p-1 transition-colors">
                        <Pencil size={14} />
                      </button>
                    }
                    onSave={data => updateExpense({ ...data, id: exp.id, paid: exp.paid })}
                    initial={exp}
                  />
                  <button
                    onClick={() => removeExpense(exp.id)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
