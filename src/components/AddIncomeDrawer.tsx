import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { type Income, type IncomeCategory, INCOME_CATEGORY_META } from "@/hooks/useIncome";

const CATEGORIES: IncomeCategory[] = [
  "Salário","Aposentadoria","Freelance","Aluguel","Investimentos","Pensão","Outros"
];

type Props = {
  onAdd: (inc: Omit<Income, "id">) => void;
};

export default function AddIncomeDrawer({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<IncomeCategory>("Salário");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recurrent, setRecurrent] = useState(false);

  const reset = () => {
    setSource("");
    setDescription("");
    setAmount("");
    setCategory("Salário");
    setDate(new Date().toISOString().slice(0, 10));
    setRecurrent(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!source || isNaN(parsed) || parsed <= 0) return;

    onAdd({ source, description, amount: parsed, category, date, recurrent });
    reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className="rounded-full w-10 h-10 shadow-lg bg-success hover:bg-success/90">
          <Plus size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Nova Receita</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pb-6">
          <div className="space-y-1.5">
            <Label>Fonte *</Label>
            <Input
              placeholder="Ex: Empresa ABC"
              value={source}
              onChange={e => setSource(e.target.value)}
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
            <Select value={category} onValueChange={v => setCategory(v as IncomeCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {INCOME_CATEGORY_META[cat].icon} {cat}
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
          <div className="flex items-center justify-between">
            <Label htmlFor="recurrent">Recorrente (mensal)</Label>
            <Switch
              id="recurrent"
              checked={recurrent}
              onCheckedChange={setRecurrent}
            />
          </div>
          <Button type="submit" className="w-full mt-2 bg-success hover:bg-success/90">
            Adicionar Receita
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
