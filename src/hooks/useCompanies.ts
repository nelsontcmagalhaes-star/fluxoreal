import { useState, useEffect } from "react";

export type RefisEntry = {
  id: string;
  description: string;
  totalAmount: number;
  installments: number;
  currentInstallment: number;
  dueDay: number;
  startDate: string;
  paid: boolean;
};

export type Company = {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
  notes?: string;
  refisEntries: RefisEntry[];
};

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>(() =>
    load("fr-v2-companies", [])
  );
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() =>
    load("fr-v2-active-company", null)
  );

  useEffect(() => {
    localStorage.setItem("fr-v2-companies", JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem("fr-v2-active-company", JSON.stringify(activeCompanyId));
  }, [activeCompanyId]);

  const activeCompany = companies.find(c => c.id === activeCompanyId) ?? null;

  const addCompany = (data: Omit<Company, "id" | "refisEntries">) => {
    const newCompany: Company = { ...data, id: `company-${Date.now()}`, refisEntries: [] };
    setCompanies(prev => [...prev, newCompany]);
    setActiveCompanyId(newCompany.id);
    return newCompany;
  };

  const updateCompany = (data: Company) =>
    setCompanies(prev => prev.map(c => c.id === data.id ? data : c));

  const removeCompany = (id: string) => {
    setCompanies(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (id === activeCompanyId) {
        setActiveCompanyId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const addRefisEntry = (companyId: string, entry: Omit<RefisEntry, "id" | "paid">) => {
    const newEntry: RefisEntry = { ...entry, id: `refis-${Date.now()}`, paid: false };
    setCompanies(prev => prev.map(c =>
      c.id === companyId
        ? { ...c, refisEntries: [...c.refisEntries, newEntry] }
        : c
    ));
  };

  const updateRefisEntry = (companyId: string, entry: RefisEntry) => {
    setCompanies(prev => prev.map(c =>
      c.id === companyId
        ? { ...c, refisEntries: c.refisEntries.map(r => r.id === entry.id ? entry : r) }
        : c
    ));
  };

  const removeRefisEntry = (companyId: string, entryId: string) => {
    setCompanies(prev => prev.map(c =>
      c.id === companyId
        ? { ...c, refisEntries: c.refisEntries.filter(r => r.id !== entryId) }
        : c
    ));
  };

  const toggleRefisPaid = (companyId: string, entryId: string) => {
    setCompanies(prev => prev.map(c =>
      c.id === companyId
        ? {
            ...c,
            refisEntries: c.refisEntries.map(r =>
              r.id === entryId ? { ...r, paid: !r.paid } : r
            )
          }
        : c
    ));
  };

  const totalRefisDebt = companies.reduce((sum, c) => {
    return sum + c.refisEntries.reduce((s, r) => {
      const remaining = r.installments - r.currentInstallment + 1;
      const installmentAmount = r.totalAmount / r.installments;
      return s + (remaining * installmentAmount);
    }, 0);
  }, 0);

  return {
    companies,
    activeCompany,
    activeCompanyId,
    setActiveCompanyId,
    totalRefisDebt,
    addCompany,
    updateCompany,
    removeCompany,
    addRefisEntry,
    updateRefisEntry,
    removeRefisEntry,
    toggleRefisPaid,
  };
}
