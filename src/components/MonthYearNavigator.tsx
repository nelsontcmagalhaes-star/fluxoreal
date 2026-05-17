import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

interface Props {
  navMonth: number;
  navYear: number;
  setNavMonth: (m: number) => void;
  setNavYear: (y: number) => void;
}

export default function MonthYearNavigator({ navMonth, navYear, setNavMonth, setNavYear }: Props) {
  const prev = () => {
    if (navMonth === 0) { setNavMonth(11); setNavYear(navYear - 1); }
    else setNavMonth(navMonth - 1);
  };
  const next = () => {
    if (navMonth === 11) { setNavMonth(0); setNavYear(navYear + 1); }
    else setNavMonth(navMonth + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-semibold min-w-[130px] text-center">
        {MONTHS[navMonth]} {navYear}
      </span>
      <button
        onClick={next}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
