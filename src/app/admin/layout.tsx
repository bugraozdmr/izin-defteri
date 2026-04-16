"use client";

import { useState } from "react";
import Sidebar from "@/shared/components/layout/admin/Sidebar";
import { Menu } from "lucide-react";
import Logo from "@/shared/components/ui/Logo";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col xl:flex-row transition-colors duration-300">
      
      <header className="xl:hidden flex items-center justify-between bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 px-4 sticky top-0 z-30 transition-colors duration-300">
        
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -mr-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? "xl:ml-20" : "xl:ml-64"
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
          <Toaster position="top-right" richColors theme="system" />
        </div>
      </main>
    </div>
  );
}