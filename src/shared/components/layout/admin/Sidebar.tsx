"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, CalendarDays, ClipboardList, 
  LogOut, ChevronLeft, ChevronRight, X, Sun, Moon, 
  CircleQuestionMark,
  UserIcon
} from "lucide-react";
import Logo from "@/shared/components/ui/Logo";

import { logoutAction } from "@/features/auth/actions";

const menuItems = [
  // { name: "Genel Bakış", href: "/admin", icon: LayoutDashboard },
  { name: "Personeller", href: "/admin/personeller", icon: UserIcon },
  // { name: "İzinler", href: "/admin/izinler", icon: ClipboardList },
  { name: "Sorular", href: "/admin/sss", icon: CircleQuestionMark },
  { name: "Tatil Takvimi", href: "/admin/tatiller", icon: CalendarDays },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-slate-950/80 backdrop-blur-sm xl:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out
          ${isCollapsed ? "xl:w-20" : "xl:w-64"}
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full xl:translate-x-0"}
        `}
      >
        <div className={`flex h-16 shrink-0 items-center border-b border-gray-100 dark:border-slate-800 px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
              <Logo />
          </div>
          
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="xl:hidden p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group ${
                  isActive 
                    ? "bg-blue-50 dark:bg-sky-500/10 text-blue-600 dark:text-sky-400" 
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                } ${isCollapsed ? "justify-center" : "gap-3"}`}
              >
                <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-blue-600 dark:text-sky-400" : "text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300"}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 dark:border-slate-800 p-3 space-y-2 shrink-0">
          
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={isCollapsed ? "Temayı Değiştir" : undefined}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white transition-colors group ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 shrink-0 transition-colors group-hover:text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 shrink-0 transition-colors group-hover:text-blue-500" />
              )}
              {!isCollapsed && <span className="truncate">{theme === "dark" ? "Açık Tema" : "Karanlık Tema"}</span>}
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden xl:flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white transition-colors ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <ChevronLeft className="h-5 w-5 shrink-0" />}
            {!isCollapsed && <span className="truncate">Menüyü Daralt</span>}
          </button>

          <form action={logoutAction} className="w-full">
            <button 
              type="submit"
              title={isCollapsed ? "Çıkış Yap" : undefined}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">Çıkış Yap</span>}
            </button>
          </form>

        </div>
      </aside>
    </>
  );
}