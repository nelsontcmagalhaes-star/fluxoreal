import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useIncome } from "@/hooks/useIncome";
import { useFixedExpenses } from "@/hooks/useFixedExpenses";
import { useCompanies } from "@/hooks/useCompanies";
import DashboardPage from "@/components/DashboardPage";
import TransactionsPage from "@/components/TransactionsPage";
import IncomePage from "@/components/IncomePage";
import FixedExpensesPage from "@/components/FixedExpensesPage";
import CardPage from "@/components/CardPage";
import CompanyPage from "@/components/CompanyPage";
import PaywallPage from "@/pages/PaywallPage";
import AuthRouter from "@/pages/auth/AuthRouter";
import NavLink from "@/components/NavLink";
import { Home, ArrowDownUp, TrendingUp, Calendar, CreditCard, Building2 } from "lucide-react";

type Tab = "home" | "transactions" | "income" | "fixed" | "card" | "company";

const FREE_LIMIT = 3;

export default function Index() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("home");
  const now = new Date();
  const [navMonth, setNavMonth] = useState(now.getMonth());
  const [navYear, setNavYear]   = useState(now.getFullYear());

  const txHook      = useTransactions(navMonth, navYear);
  const incomeHook  = useIncome(navMonth, navYear);
  const fixedHook   = useFixedExpenses();
  const companyHook = useCompanies();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthRouter />;

  // Trial paywall: limit free users to FREE_LIMIT transactions
  const isTrialExceeded = txHook.transactions.length >= FREE_LIMIT;
  if (isTrialExceeded && tab !== "home") {
    // allow viewing home; paywall on other tabs
  }

  const navProps = { navMonth, navYear, setNavMonth, setNavYear };

  const renderPage = () => {
    switch (tab) {
      case "home":
        return <DashboardPage {...txHook} {...incomeHook} {...fixedHook} {...navProps} onTabChange={setTab} />;
      case "transactions":
        if (isTrialExceeded) return <PaywallPage />;
        return <TransactionsPage {...txHook} {...navProps} />;
      case "income":
        if (isTrialExceeded) return <PaywallPage />;
        return <IncomePage {...incomeHook} {...navProps} />;
      case "fixed":
        if (isTrialExceeded) return <PaywallPage />;
        return <FixedExpensesPage {...fixedHook} />;
      case "card":
        if (isTrialExceeded) return <PaywallPage />;
        return <CardPage {...txHook} {...navProps} />;
      case "company":
        if (isTrialExceeded) return <PaywallPage />;
        return <CompanyPage {...companyHook} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {renderPage()}
      </main>

      {/* Bottom navigation */}
      <nav className="nav-blur fixed bottom-0 inset-x-0 border-t border-border flex justify-around py-2 z-50">
        <NavLink icon={<Home size={22} />}         label="Início"       active={tab === "home"}         onClick={() => setTab("home")} />
        <NavLink icon={<ArrowDownUp size={22} />}  label="Gastos"       active={tab === "transactions"} onClick={() => setTab("transactions")} />
        <NavLink icon={<TrendingUp size={22} />}   label="Receitas"     active={tab === "income"}       onClick={() => setTab("income")} />
        <NavLink icon={<Calendar size={22} />}     label="Fixos"        active={tab === "fixed"}        onClick={() => setTab("fixed")} />
        <NavLink icon={<CreditCard size={22} />}   label="Cartão"       active={tab === "card"}         onClick={() => setTab("card")} />
        <NavLink icon={<Building2 size={22} />}    label="Empresa"      active={tab === "company"}      onClick={() => setTab("company")} />
      </nav>
    </div>
  );
}
