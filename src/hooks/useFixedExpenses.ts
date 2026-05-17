import { useState, useEffect } from "react";

export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  paid: boolean;
  icon: string;
};

const DEFAULT_FIXED: FixedExpense[] = [];

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

export function useFixedExpenses() {
  const [expenses, setExpenses] = useState<FixedExpense[]>(() =>
    load("fr-v2-fixed-expenses", DEFAULT_FIXED)
  );

  useEffect(() => {
    localStorage.setItem("fr-v2-fixed-expenses", JSON.stringify(expenses));
  }, [expenses]);

  const totalFixed   = expenses.reduce((s, e) => s + e.amount, 0);
  const totalPaid    = expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => !e.paid).reduce((s, e) => s + e.amount, 0);
  const paidCount    = expenses.filter(e => e.paid).length;

  const togglePaid = (id: string) =>
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e));

  const resetMonth = () =>
    setExpenses(prev => prev.map(e => ({ ...e, paid: false })));

  const addExpense = (data: Omit<FixedExpense, "id" | "paid">) =>
    setExpenses(prev => [...prev, { ...data, id: `fe-${Date.now()}`, paid: false }]);

  const updateExpense = (data: FixedExpense) =>
    setExpenses(prev => prev.map(e => e.id === data.id ? data : e));

  const removeExpense = (id: string) =>
    setExpenses(prev => prev.filter(e => e.id !== id));

  return {
    expenses,
    totalFixed,
    totalPaid,
    totalPending,
    paidCount,
    togglePaid,
    resetMonth,
    addExpense,
    updateExpense,
    removeExpense,
  };
}
