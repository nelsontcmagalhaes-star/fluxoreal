import { useState } from "react";
import { type Company, type RefisEntry, formatCNPJ } from "@/hooks/useCompanies";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2, Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  companies: Company[];
  activeCompany: Company | null;
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string) => void;
  totalRefisDebt: number;
  addCompany: (data: Omit<Company, "id" | "refisEntries">) => Company;
  updateCompany: (data: Company) => void;
  removeCompany: (id: string) => void;
  addRefisEntry: (companyId: string, entry: Omit<RefisEntry, "id" | "paid">) => void;
  updateRefisEntry: (companyId: string, entry: RefisEntry) => void;
  removeRefisEntry: (companyId: string, entryId: string) => void;
  toggleRefisPaid: (companyId: string, entryId: string) => void;
};

function CompanyFormSheet({
  trigger, onSave, initial,
}: {
  trigger: React.ReactNode;
  onSave: (data: Omit<Company, "id" | "refisEntries">) => void;
  initial?: Company;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [cnpj, setCnpj] = useState(initial?.cnpj ?? "");
  const [segment, setSegment] = useState(initial?.segment ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({ name, cnpj, segment, notes });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle>{initial ? "Editar Empresa" : "Nova Empresa"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSave} className="space-y-4 pb-6">
          <div className="space-y-1.5">
            <Label>Nome da Empresa *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Razão Social" required />
          </div>
          <div className="space-y-1.5">
            <Label>CNPJ</Label>
            <Input
              value={cnpj}
              onChange={e => setCnpj(formatCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Segmento</Label>
            <Input value={segment} onChange={e => setSegment(e.target.value)} placeholder="Ex: Comércio, Serviços" />
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" />
          </div>
          <Button type="submit" className="w-full">Salvar Empresa</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function RefisFormSheet({
  trigger, onSave, companyId, initial,
}: {
  trigger: React.ReactNode;
  onSave: (entry: Omit<RefisEntry, "id" | "paid">) => void;
  companyId: string;
  initial?: RefisEntry;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [totalAmount, setTotalAmount] = useState(initial ? String(initial.totalAmount) : "");
  const [installments, setInstallments] = useState(initial ? String(initial.installments) : "");
  const [currentInstallment, setCurrentInstallment] = useState(initial ? String(initial.currentInstallment) : "1");
  const [dueDay, setDueDay] = useState(initial ? String(initial.dueDay) : "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? new Date().toISOString().slice(0, 10));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalAmount.replace(",", "."));
    if (!description || isNaN(total)) return;
    onSave({
      description,
      totalAmount: total,
      installments: parseInt(installments) || 1,
      currentInstallment: parseInt(currentInstallment) || 1,
      dueDay: parseInt(dueDay) || 1,
      startDate,
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{initial ? "Editar REFIS" : "Novo REFIS / Parcelamento"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSave} className="space-y-4 pb-6">
          <div className="space-y-1.5">
            <Label>Descrição *</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: REFIS Federal 2023" required />
          </div>
          <div className="space-y-1.5">
            <Label>Valor Total (R$) *</Label>
            <Input type="number" step="0.01" min="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0,00" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Total de Parcelas</Label>
              <Input type="number" min="1" value={installments} onChange={e => setInstallments(e.target.value)} placeholder="60" />
            </div>
            <div className="space-y-1.5">
              <Label>Parcela Atual</Label>
              <Input type="number" min="1" value={currentInstallment} onChange={e => setCurrentInstallment(e.target.value)} placeholder="1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Vencimento (dia)</Label>
              <Input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="10" />
            </div>
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function RefisCard({
  entry, companyId,
  onTogglePaid, onUpdate, onRemove,
}: {
  entry: RefisEntry;
  companyId: string;
  onTogglePaid: () => void;
  onUpdate: (e: Omit<RefisEntry, "id" | "paid">) => void;
  onRemove: () => void;
}) {
  const installmentAmount = entry.installments > 0 ? entry.totalAmount / entry.installments : entry.totalAmount;
  const remaining = Math.max(0, entry.installments - entry.currentInstallment + 1);

  return (
    <div className={cn("card-surface p-4 space-y-2", entry.paid && "opacity-60")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-semibold text-sm">{entry.description}</p>
          <p className="text-xs text-muted-foreground">
            Parcela {entry.currentInstallment}/{entry.installments} · Vence dia {entry.dueDay}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <RefisFormSheet
            trigger={<button className="text-muted-foreground hover:text-primary p-1 transition-colors"><Pencil size={13} /></button>}
            onSave={onUpdate}
            companyId={companyId}
            initial={entry}
          />
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive p-1 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Parcela: <span className="font-semibold text-foreground">{fmt(installmentAmount)}</span></span>
        <span className="text-muted-foreground">Restante: <span className="font-semibold text-destructive">{fmt(remaining * installmentAmount)}</span></span>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-[10px]">Total: {fmt(entry.totalAmount)}</Badge>
        <button
          onClick={onTogglePaid}
          className={cn(
            "flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors",
            entry.paid
              ? "bg-success text-white"
              : "bg-muted text-muted-foreground hover:bg-primary hover:text-white"
          )}
        >
          {entry.paid && <Check size={12} />}
          {entry.paid ? "Paga" : "Marcar paga"}
        </button>
      </div>
    </div>
  );
}

export default function CompanyPage(props: Props) {
  const {
    companies, activeCompany, activeCompanyId, setActiveCompanyId,
    totalRefisDebt,
    addCompany, updateCompany, removeCompany,
    addRefisEntry, updateRefisEntry, removeRefisEntry, toggleRefisPaid,
  } = props;

  const [expanded, setExpanded] = useState<string | null>(activeCompanyId);

  return (
    <div className="px-4 pt-6 pb-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="micro-label">Gestão Empresarial</p>
          <h1 className="text-xl font-bold">Empresas & REFIS</h1>
        </div>
        <CompanyFormSheet
          trigger={
            <Button size="icon" className="rounded-full w-10 h-10 shadow-lg">
              <Plus size={20} />
            </Button>
          }
          onSave={data => { const c = addCompany(data); setExpanded(c.id); }}
        />
      </div>

      {/* Total debt */}
      {totalRefisDebt > 0 && (
        <div className="card-surface p-4 flex justify-between items-center">
          <div>
            <p className="micro-label">Dívida Total REFIS</p>
            <p className="text-xl font-bold text-destructive">{fmt(totalRefisDebt)}</p>
          </div>
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {/* Companies */}
      {companies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🏢</p>
          <p className="font-medium">Nenhuma empresa cadastrada</p>
          <p className="text-sm">Toque em + para adicionar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map(company => {
            const isExpanded = expanded === company.id;
            const companyDebt = company.refisEntries.reduce((s, r) => {
              const remaining = Math.max(0, r.installments - r.currentInstallment + 1);
              return s + (remaining * (r.totalAmount / r.installments));
            }, 0);

            return (
              <div key={company.id} className="card-surface overflow-hidden">
                {/* Company header */}
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    setExpanded(isExpanded ? null : company.id);
                    setActiveCompanyId(company.id);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {company.cnpj || company.segment || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {companyDebt > 0 && (
                      <span className="text-xs font-bold text-destructive">{fmt(companyDebt)}</span>
                    )}
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                    {/* Company actions */}
                    <div className="flex gap-2 justify-end">
                      <CompanyFormSheet
                        trigger={
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded transition-colors">
                            <Pencil size={12} /> Editar
                          </button>
                        }
                        onSave={data => updateCompany({ ...data, id: company.id, refisEntries: company.refisEntries })}
                        initial={company}
                      />
                      <button
                        onClick={() => removeCompany(company.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded transition-colors"
                      >
                        <Trash2 size={12} /> Remover
                      </button>
                    </div>

                    {/* REFIS entries */}
                    <div className="flex items-center justify-between">
                      <p className="micro-label">REFIS / Parcelamentos</p>
                      <RefisFormSheet
                        trigger={
                          <button className="flex items-center gap-1 text-xs text-primary font-semibold">
                            <Plus size={12} /> Adicionar
                          </button>
                        }
                        onSave={entry => addRefisEntry(company.id, entry)}
                        companyId={company.id}
                      />
                    </div>

                    {company.refisEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">
                        Nenhum parcelamento cadastrado
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {company.refisEntries.map(entry => (
                          <RefisCard
                            key={entry.id}
                            entry={entry}
                            companyId={company.id}
                            onTogglePaid={() => toggleRefisPaid(company.id, entry.id)}
                            onUpdate={data => updateRefisEntry(company.id, { ...data, id: entry.id, paid: entry.paid })}
                            onRemove={() => removeRefisEntry(company.id, entry.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
