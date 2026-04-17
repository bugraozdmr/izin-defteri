import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function DatePicker({
  value,
  onChange,
  placeholder = "Tarih Seçin",
  required = false,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"date" | "year">("date");
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; placement: "bottom" | "top" } | null>(null);

  const close = () => {
    setIsOpen(false);
    setMode("date");
    setPanelPos(null);
  };

  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });

  useEffect(() => {
    if (!isOpen) return;

    setViewDate(value ? new Date(value) : new Date());
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const anchor = containerRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const panelWidth = 288; // w-72
      const estimatedPanelHeight = mode === "year" ? 260 : 340;
      const gap = 8;
      const margin = 8;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const placement: "bottom" | "top" =
        spaceBelow < estimatedPanelHeight + gap && spaceAbove > estimatedPanelHeight + gap ? "top" : "bottom";

      const top =
        placement === "bottom" ? rect.bottom + gap : Math.max(margin, rect.top - estimatedPanelHeight - gap);

      const left = Math.min(Math.max(margin, rect.left), window.innerWidth - panelWidth - margin);

      setPanelPos({ top, left, placement });
    };

    updatePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, mode]);

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const currentYear = viewDate.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleSelectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, "0");
    const d = String(selected.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${d}`);
    close();
  };

  const handleSelectYear = (selectedYear: number) => {
    setViewDate(new Date(selectedYear, viewDate.getMonth(), 1));
    setMode("date"); // Yılı seçince tekrar takvime dön
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const displayValue = value 
    ? new Date(value).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => {
          if (disabled) return;
          return isOpen ? close() : setIsOpen(true);
        }}
        aria-disabled={disabled}
        className={`w-full flex items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition cursor-pointer dark:bg-slate-950 dark:border-slate-800
          ${isOpen ? "border-sky-500 ring-2 ring-sky-500/20" : "border-slate-200 hover:border-slate-300 dark:hover:border-slate-700"}
          ${value ? "text-slate-700 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}
          ${disabled ? "opacity-60 cursor-not-allowed hover:border-slate-200 dark:hover:border-slate-800" : ""}
        `}
      >
        <span>{displayValue || placeholder}</span>
        <CalendarIcon className="h-4 w-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
      </div>

      <input type="text" className="hidden" value={value} required={required && !disabled} disabled={disabled} readOnly />

      {isOpen && panelPos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              className="fixed z-[9999] w-72 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95 animate-in fade-in zoom-in-95 duration-200"
              style={{
                top: panelPos.top,
                left: panelPos.left,
                transformOrigin: panelPos.placement === "bottom" ? "top left" : "bottom left",
              }}
            >
              {mode === "date" ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setMode("year")}
                  className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-sky-500 dark:hover:text-sky-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {MONTHS[month]} {year}
                </button>

                <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 w-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = value && new Date(value).getDate() === day && new Date(value).getMonth() === month && new Date(value).getFullYear() === year;
                  const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${isSelected ? "bg-sky-500 text-white shadow-md shadow-sky-500/30" : isToday ? "text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-400 hover:bg-sky-100" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Yıl Seçin</span>
                <button type="button" onClick={() => setMode("date")} className="text-xs font-semibold text-sky-500 hover:text-sky-600">İptal</button>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleSelectYear(y)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors ${y === year ? "bg-sky-500 text-white shadow-md" : "bg-slate-50 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}