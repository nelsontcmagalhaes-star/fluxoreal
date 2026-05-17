import { useState, useEffect } from "react";

export type Category =
  | "Farmácia" | "Supermercado" | "Alimentação" | "Combustível"
  | "Saúde" | "Lazer" | "Casa" | "Estacionamento" | "Outros";

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  description: string;
  amount: number;
  installments: number;
  currentInstallment: number;
  category: Category;
  cardId: string;
};

export type CreditCard = {
  id: string;
  name: string;
  bank: string;
  lastFourDigits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color?: string;
  notes?: string;
};

export const CATEGORY_META: Record<Category, { icon: string; bg: string }> = {
  Farmácia:      { icon: "💊", bg: "hsl(0 100% 97%)" },
  Supermercado:  { icon: "🛒", bg: "hsl(142 71% 97%)" },
  Alimentação:   { icon: "🍽️", bg: "hsl(38 92% 97%)" },
  Combustível:   { icon: "⛽", bg: "hsl(217 70% 97%)" },
  Saúde:         { icon: "❤️‍🩹", bg: "hsl(330 70% 97%)" },
  Lazer:         { icon: "🎭", bg: "hsl(280 70% 97%)" },
  Casa:          { icon: "🏠", bg: "hsl(45 92% 97%)" },
  Estacionamento:{ icon: "🅿️", bg: "hsl(200 70% 97%)" },
  Outros:        { icon: "📦", bg: "hsl(220 10% 97%)" },
};

const DEFAULT_CARDS: CreditCard[] = [];

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

export function useTransactions(navMonth: number, navYear: number) {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    load("fr-v2-transactions", [])
  );
  const [cards, setCards] = useState<CreditCard[]>(() =>
    load("fr-v2-cards", DEFAULT_CARDS)
  );
  const [activeCardId, setActiveCardIdState] = useState<string>(() =>
    load("fr-v2-active-card", "")
  );

  useEffect(() => { localStorage.setItem("fr-v2-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("fr-v2-cards", JSON.stringify(cards)); }, [cards]);
  useEffect(() => { localStorage.setItem("fr-v2-active-card", JSON.stringify(activeCardId)); }, [activeCardId]);

  const card = cards.find(c => c.id === activeCardId) ?? cards[0] ?? null;
  const monthPrefix = `${navYear}-${String(navMonth + 1).padStart(2, "0")}`;

  const monthTxs = transactions.filter(
    tx => tx.cardId === activeCardId && tx.date.startsWith(monthPrefix)
  );

  const totalSpent    = monthTxs.reduce((s, t) => s + t.amount, 0);
  const availableLimit = Math.max(0, (card?.limit ?? 0) - totalSpent);
  const usedPercent   = (card?.limit ?? 0) > 0 ? (totalSpent / (card?.limit ?? 1)) * 100 : 0;

  const categoryMap: Record<string, number> = {};
  for (const tx of monthTxs) categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
  const categorySorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  const top5 = [...monthTxs].sort((a, b) => b.amount - a.amount).slice(0, 5);

  const addTransaction = (tx: Omit<Transaction, "id" | "cardId">) => {
    setTransactions(prev => [{ ...tx, id: Date.now().toString(), cardId: activeCardId }, ...prev]);
  };

  const removeTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const setActiveCardId = (id: string) => setActiveCardIdState(id);

  const updateCard = (data: CreditCard) =>
    setCards(prev => prev.map(c => c.id === data.id ? data : c));

  const addCard = (data: Omit<CreditCard, "id">) => {
    const newCard = { ...data, id: `card-${Date.now()}` };
    setCards(prev => [...prev, newCard]);
    setActiveCardIdState(newCard.id);
  };

  const removeCard = (id: string) => {
    setCards(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (id === activeCardId && filtered.length > 0) setActiveCardIdState(filtered[0].id);
      return filtered;
    });
  };

  return {
    transactions,
    monthTxs,
    card,
    cards,
    activeCardId,
    setActiveCardId,
    totalSpent,
    availableLimit,
    usedPercent,
    categorySorted,
    top5,
    addTransaction,
    removeTransaction,
    updateCard,
    addCard,
    removeCard,
  };
}
