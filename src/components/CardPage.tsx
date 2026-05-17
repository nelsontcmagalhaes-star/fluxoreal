import { useState } from "react";
import { type CreditCard, type Transaction, CATEGORY_META } from "@/hooks/useTransactions";
import MonthYearNavigator from "@/components/MonthYearNavigator";
import AddTransactionDrawer from "@/components/AddTransactionDrawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, CreditCard as CreditCardIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CARD_COLORS = [
  "#1d4ed8","#7c3aed","#db2777","#059669","#d97706","#dc2626","#0891b2","#374151"
];

type Props = {
  cards: CreditCard[];
  card: CreditCard | null;
  activeCardId: string;
  setActiveCardId: (id: string) => void;
  monthTxs: Transaction[];
  totalSpent: number;
  availableLimit: number;
  usedPercent: number;
  addTransaction: (tx: Omit<Transaction, "id" | "cardId">) => void;
  removeTransaction: (id: string) => void;
  addCard: (data: Omit<CreditCard, "id">) => void;
  updateCard: (data: CreditCard) => void;
  removeCard: (id: string) => void;
  navMonth: number;
  navYear: number;
  setNavMonth: (m: number) => void;
  setNavYear: (y: number) => void;
};

function CardFormSheet({
  trigger,
  onSave,
  initial,
}: {
  trigger: React.ReactNode;
  onSave: (data: Omit<CreditCard, "id">) => void;
  initial?: CreditCard;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [bank, setBank] = useState(initial?.bank ?? "");
  const [lastFour, setLastFour] = useState(initial?.lastFourDigits ?? "");
  const [limit, setLimit] = useState(initial ? String(initial.limit) : "");
  const [closingDay, setClosingDay] = useState(initial ? String(initial.closingDay) : "");
  const [dueDay, setDueDay] = useState(initial ? String(initial.dueDay) : "");
  const [color, setColor] = useState(initial?.color ?? CARD_COLORS[0]);
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limit.replace(",", "."));
    if (!name || !bank || isNaN(parsedLimit)) return;
    onSave({
      name, bank,
      lastFourDigits: lastFour.slice(-4).padStart(4, "0"),
      limit: parsedLimit,
      closingDay: parseInt(closingDay) || 1,
      dueDay: parseInt(dueDay) || 10,
      color, notes,
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{initial ? "Editar Cartão" : "Novo Cartão"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSave} className="space-y-4 pb-6">
          <div className="space-y-1.5">
            <Label>Nome do cartão *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Nubank Ultravioleta" required />
          </div>
          <div className="space-y-1.5">
            <Label>Banco / Instituição *</Label>
            <Input value={bank} onChange={e => setBank(e.target.value)} placeholder="Ex: Nubank" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>4 últimos dígitos</Label>
              <Input value={lastFour} onChange={e => setLastFour(e.target.value)} placeholder="0000" maxLength={4} />
            </div>
            <div className="space-y-1.5">
              <Label>Limite (R$) *</Label>
              <Input type="number" step="0.01" min="1" value={limit} onChange={e => setLimit(e.target.value)} placeholder="5000" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fechamento (dia)</Label>
              <Input type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} placeholder="15" />
            </div>
            <div className="space-y-1.5">
              <Label>Vencimento (dia)</Label>
              <Input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="25" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Cor do cartão</Label>
            <div className="flex gap-2 flex-wrap">
              {CARD_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" />
          </div>
          <Button type="submit" className="w-full">Salvar Cartão</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function CardPage(props: Props) {
  const {
    cards, card, activeCardId, setActiveCardId,
    monthTxs, totalSpent, availableLimit, usedPercent,
    addTransaction, removeTransaction, addCard, updateCard, removeCard,
    navMonth, navYear, setNavMonth, setNavYear,
  } = props;

  return (
    <div className="px-4 pt-6 pb-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="micro-label">Cartões de Crédito</p>
          <h1 className="text-xl font-bold">Cartão</h1>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearNavigator navMonth={navMonth} navYear={navYear} setNavMonth={setNavMonth} setNavYear={setNavYear} />
          <CardFormSheet
            trigger={
              <Button size="icon" className="rounded-full w-10 h-10 shadow-lg">
                <Plus size={20} />
              </Button>
            }
            onSave={addCard}
          />
        </div>
      </div>

      {/* Card selector */}
      {cards.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-5xl mb-3">💳</p>
          <p className="font-semibold text-foreground">Nenhum cartão cadastrado</p>
          <p className="text-sm mt-1">Toque em + para adicionar seu primeiro cartão</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {cards.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCardId(c.id)}
              className={cn(
                "shrink-0 rounded-2xl p-4 text-left min-w-[180px] transition-all",
                activeCardId === c.id ? "ring-2 ring-primary" : "opacity-70"
              )}
              style={{ background: c.color ?? "#C98A42" }}
            >
              <p className="text-white/70 text-xs font-medium mb-3">{c.bank}</p>
              <p className="text-white font-bold text-sm mb-4">•••• •••• •••• {c.lastFourDigits}</p>
              <p className="text-white font-semibold text-sm">{c.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Active card details */}
      {card && (
        <div className="card-surface p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">{card.name}</p>
              <p className="text-xs text-muted-foreground">{card.bank}</p>
            </div>
            <div className="flex gap-2">
              <CardFormSheet
                trigger={
                  <button className="text-muted-foreground hover:text-primary p-1 transition-colors">
                    <Pencil size={16} />
                  </button>
                }
                onSave={data => updateCard({ ...data, id: card.id })}
                initial={card}
              />
              {cards.length > 1 && (
                <button
                  onClick={() => removeCard(card.id)}
                  className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="micro-label">Limite Total</p>
              <p className="font-bold">{fmt(card.limit)}</p>
            </div>
            <div>
              <p className="micro-label">Disponível</p>
              <p className="font-bold text-success">{fmt(availableLimit)}</p>
            </div>
            <div>
              <p className="micro-label">Fechamento</p>
              <p className="font-medium">Dia {card.closingDay}</p>
            </div>
            <div>
              <p className="micro-label">Vencimento</p>
              <p className="font-medium">Dia {card.dueDay}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Gasto: <span className="font-semibold text-destructive">{fmt(totalSpent)}</span></span>
              <Badge variant={usedPercent > 80 ? "destructive" : "secondary"}>{usedPercent.toFixed(0)}% usado</Badge>
            </div>
            <Progress value={usedPercent} className="h-2" />
          </div>
        </div>
      )}

      {/* Add transaction */}
      <div className="flex items-center justify-between">
        <p className="micro-label">Lançamentos do Mês</p>
        <AddTransactionDrawer onAdd={addTransaction} />
      </div>

      {/* Transactions */}
      <div className="space-y-2">
        {monthTxs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-sm">Nenhum lançamento este mês</p>
          </div>
        ) : (
          monthTxs.map(tx => {
            const meta = CATEGORY_META[tx.category] ?? { icon: "📦", bg: "hsl(220 10% 97%)" };
            return (
              <div key={tx.id} className="card-surface p-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: meta.bg }}>
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{tx.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category}
                    {tx.installments > 1 && (
                      <Badge variant="secondary" className="ml-1 text-[10px] py-0">{tx.currentInstallment}/{tx.installments}x</Badge>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-destructive tabular">{fmt(tx.amount)}</span>
                  <button onClick={() => removeTransaction(tx.id)} className="text-muted-foreground hover:text-destructive p-1 transition-colors">
                    <Trash2 size={14} />
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
