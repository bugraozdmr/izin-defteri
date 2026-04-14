import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

export default function Footer() {
  const links = [
    // { href: "/sorgula", label: "Sorgula" },
    { href: "/izin-talebi-olustur", label: "Talep Formu" },
    { href: "/resmi-tatiller", label: "Resmi Tatiller" },
    { href: "/sss", label: "Sık Sorulan Sorular" },
  ];

  return (
    <footer className="relative border-t border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] transition-colors duration-300 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#0b1220_0%,#020617_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/65 to-transparent" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <Logo size={36} className="rounded-xl shadow-sm" title="İzin Defteri" />
          </div>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Artık elle kağıt doldurmaya gerek kalmadan dijital ortamda izin taleplerini oluştur, indir ve yazdır.
          </p>

        </div>

        <div className="lg:col-span-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Hızlı Linkler
          </p>
          <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              Bilgi
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Kağıtların çıktı alınması sonucunda imzalanması ve teslim edilmesi gerekmektedir.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} İzin Defteri</span>
        </div>
      </div>
    </footer>
  );
}