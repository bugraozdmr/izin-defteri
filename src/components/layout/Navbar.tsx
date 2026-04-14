"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";

import { useTheme } from "next-themes";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const navLinks = [
        // { href: "/sorgula", label: "Sorgula" },
        { href: "/tatiller", label: "Tatiller" },
        { href: "/sss", label: "SSS" },
        { href: "/izin-talebi-olustur", label: "İzin Formu Oluştur" },
    ];

    return (
        <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:px-4">
            <div className="pointer-events-auto w-full max-w-7xl rounded-2xl border border-slate-200/80 bg-white/72 shadow-[0_14px_34px_-16px_rgba(2,6,23,0.45)] backdrop-blur-xl transition-all dark:border-slate-800/90 dark:bg-slate-900/70">
                <div className="relative flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/65 to-transparent" />

                    <Link
                        href="/"
                        className="group flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.99]"
                        onClick={() => setIsOpen(false)}
                    >
                        <Logo size={40} title="İzin Defteri" />
                    </Link>

                    <nav className="hidden flex-1 items-center justify-center gap-1.5 md:flex">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={
                                        "rounded-xl px-4 py-2 text-sm font-semibold transition-all " +
                                        (isActive
                                            ? "bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-[0_10px_28px_-16px_rgba(2,132,199,0.9)]"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white")
                                    }
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                aria-label="Temayı Değiştir"
                            >
                                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        )}

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 text-slate-700 transition-colors active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 md:hidden"
                            aria-label="Menüyü Aç"
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <nav className="space-y-2 border-t border-slate-200/70 p-4 dark:border-slate-800 md:hidden">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                            Hızlı Erişim
                        </div>
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={
                                        "flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold transition-colors " +
                                        (isActive
                                            ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                                    }
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </div>
        </header>
    );
}