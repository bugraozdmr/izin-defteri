"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/admin/Sidebar";
import { Menu } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row transition-all duration-300">
      
      <header className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 h-16 px-4 sticky top-0 z-30">
        
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}