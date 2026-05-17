import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { type Transaction, type Category, CATEGORY_META } from "@/hooks/useTransactions";

const CATEGORIES: Category[] = [
  "Farmácia","Supermercado","Alimentação","Combustível",
  "Saúde","Lazer","Casa","Estacionamento","Outros"
];

type Props = {
  onAdd: (tx: Omit<Transaction, "id" | "cardId">) => void;
};

export default function AddTransactionDrawer({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Outros");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [installments, setInstallments] = useState("1");
  const [currentInstallment, setCurrentInstallment] = useState("1");

  const reset = () => {
    setMerchant("");
    setDescription("");
    setAmount("");
    setCategory("Outros");
    setDate(new Date().toISOString().slice(0, 10));
    setInstallments("1");
    setCurrentInstallment("1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!merchant || isNaN(parsed) || parsed <= 0) return;

    onAdd({
      merchant,
      description,
      amount: parsed,
      category,
      date,
      installments: parseInt(installments) || 1,
      currentInstallment: parseInt(currentInstallment) || 1,
    });
    reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className="rounded-full w-10 h-10 shadow-lg">
          <Plus size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Nova Transação</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pb-6">
          <div className="space-y-1.5">
            <Label>Estabelecimento *</Label>
            <Input
              placeholder="Ex: Mercado Extra"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input
              placeholder="Detalhe opcional"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Valor (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={v => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_META[cat].icon} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Parcelas</Label>
              <Input
                type="number"
                min="1"
                max="48"
                value={installments}
                onChange={e => setInstallments(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parcela atual</Label>
              <Input
                type="number"
                min="1"
                max={installments}
                value={currentInstallment}
                onChange={e => setCurrentInstallment(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2">
            Adicionar Transação
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
