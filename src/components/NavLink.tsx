import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function NavLink({ icon, label, active, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[48px]",
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span className={cn("transition-transform", active && "scale-110")}>{icon}</span>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}
