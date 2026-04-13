"use client";

import { ArrowRight, LockKeyhole, ShieldCheck, User2 } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions/auth.action";
import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f4f8ff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0b1220_42%,#09111e_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="floating-orb absolute -left-20 top-16 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-800/35" />
        <div className="floating-orb-delay absolute -right-20 top-40 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-800/30" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.22),transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:grid-cols-2">
          <div className="relative hidden h-full items-center justify-center overflow-hidden border-r border-slate-200/70 bg-[linear-gradient(160deg,#0284c7_0%,#0891b2_48%,#0f766e_100%)] p-10 text-white dark:border-slate-800 lg:flex">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex h-80 w-80 items-center justify-center">
              <div className="absolute h-72 w-72 rounded-full border border-white/20" />
              <div className="absolute h-56 w-56 rounded-full border border-white/20" />
              <div className="absolute h-40 w-40 rounded-full bg-white/15 backdrop-blur-sm" />

              <Logo
                size={96}
                title="Yetkili Erişim"
                className="relative z-10 shadow-[0_20px_40px_-20px_rgba(2,6,23,0.85)]"
              />

              <div className="absolute right-12 top-14 z-20 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="reveal reveal-1 p-6 sm:p-10 lg:p-12">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              { /* <Logo size={42} title="İzin Defteri" className="shadow-[0_8px_22px_-10px_rgba(15,23,42,0.7)]" /> */ }
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  İzin Defteri
                </p>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Yönetici Girişi
                </h1>
              </div>
            </div>


            <form action={formAction} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300"
                >
                  Kullanıcı Adı
                </label>
                <div className="group relative">
                  <User2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-500" />
                  <input
                    id="username"
                    type="text"
                    name="username"
                    required
                    autoComplete="username"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300"
                >
                  Şifre
                </label>
                <div className="group relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-500" />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              {state?.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/35 dark:text-red-300">
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-16px_rgba(2,132,199,0.95)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
                {!isPending && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}