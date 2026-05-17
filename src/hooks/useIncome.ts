import { useState, useEffect } from "react";

export type IncomeCategory =
  | "Salário" | "Aposentadoria" | "Freelance" | "Aluguel"
  | "Investimentos" | "Pensão" | "Outros";

export type Income = {
  id: string;
  date: string;
  source: string;
  description: string;
  amount: number;
  category: IncomeCategory;
  recurrent: boolean;
};

export const INCOME_CATEGORY_META: Record<IncomeCategory, { icon: string; bg: string }> = {
  Salário:       { icon: "💼", bg: "hsl(142 71% 97%)" },
  Aposentadoria: { icon: "🏦", bg: "hsl(217 70% 97%)" },
  Freelance:     { icon: "💻", bg: "hsl(280 70% 97%)" },
  Aluguel:       { icon: "🏠", bg: "hsl(45 92% 97%)" },
  Investimentos: { icon: "📈", bg: "hsl(142 50% 97%)" },
  Pensão:        { icon: "👨‍👩‍👧", bg: "hsl(330 70% 97%)" },
  Outros:        { icon: "💰", bg: "hsl(220 10% 97%)" },
};

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

export function useIncome(navMonth: number, navYear: number) {
  const [incomes, setIncomes] = useState<Income[]>(() => load("fr-v2-incomes", []));

  useEffect(() => {
    localStorage.setItem("fr-v2-incomes", JSON.stringify(incomes));
  }, [incomes]);

  const monthPrefix = `${navYear}-${String(navMonth + 1).padStart(2, "0")}`;

  const monthIncomes = incomes.filter(inc => inc.date.startsWith(monthPrefix));
  const totalIncome = monthIncomes.reduce((s, inc) => s + inc.amount, 0);

  const categoryMap: Record<string, number> = {};
  for (const inc of monthIncomes) {
    categoryMap[inc.category] = (categoryMap[inc.category] || 0) + inc.amount;
  }
  const categorySorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  const addIncome = (inc: Omit<Income, "id">) => {
    setIncomes(prev => [{ ...inc, id: Date.now().toString() }, ...prev]);
  };

  const removeIncome = (id: string) => setIncomes(prev => prev.filter(i => i.id !== id));

  const updateIncome = (data: Income) =>
    setIncomes(prev => prev.map(i => i.id === data.id ? data : i));

  return {
    incomes,
    monthIncomes,
    totalIncome,
    categorySorted,
    addIncome,
    removeIncome,
    updateIncome,
  };
}
