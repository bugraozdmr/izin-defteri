import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-100px)] items-center overflow-hidden  px-6 py-24 transition-colors duration-300 sm:py-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="floating-orb absolute -left-24 top-12 h-80 w-80 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-800/35" />
        <div className="floating-orb-delay absolute -right-24 top-28 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-800/30" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.2),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.25),transparent_70%)]" />
      </div>

      <section className="relative mx-auto w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.5)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:grid-cols-2">
          <div className="relative hidden items-center justify-center overflow-hidden border-r border-slate-200/70 bg-[linear-gradient(145deg,#0284c7_0%,#0891b2_50%,#0f766e_100%)] p-10 text-white dark:border-slate-800 lg:flex">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex h-80 w-80 items-center justify-center">
              <div className="absolute h-72 w-72 rounded-full border border-white/25" />
              <div className="absolute h-56 w-56 rounded-full border border-white/25" />
              <div className="absolute h-44 w-44 rounded-full bg-white/10 backdrop-blur-sm" />
              <span className="absolute text-8xl font-black tracking-tight text-white/20">404</span>
            </div>
          </div>

          <div className="reveal reveal-1 p-8 sm:p-10 lg:p-12">

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Sayfa Bulunamadı
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Aradığınız içerik taşınmış, kaldırılmış veya bağlantı hatalı olabilir. Ana sayfaya dönerek devam edebilirsiniz.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-14px_rgba(2,132,199,0.95)] transition-all hover:-translate-y-0.5 hover:brightness-105"
              >
                <Home className="h-4 w-4" />
                Ana Sayfa
              </Link>

              <Link
                href="/sorgula"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/85 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-950"
              >
                <Search className="h-4 w-4" />
                Sorgula
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}