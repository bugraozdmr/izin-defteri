"use client";

import { CircleQuestionMark, MessageCircleMore, Loader2 } from "lucide-react";
import { useSSS } from "@/app/(home)/sss/hooks/useSSS";

export default function HomeFaqPage() {
    const { faqList, isLoading } = useSSS();

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 pt-24 transition-colors duration-300 dark:bg-[#020617]">
            <div className="relative mx-auto min-h-[calc(100vh-140px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                { /* <div className="pointer-events-none absolute inset-0">
                    <div className="floating-orb absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-800/30" />
                    <div className="floating-orb-delay absolute -right-16 top-32 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/25" />
                </div> */ }
                
                <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
                    <div className="text-center md:text-left">
                        <h1 className="flex items-center justify-center gap-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:justify-start">
                            <MessageCircleMore className="h-8 w-8 text-sky-500" />
                            Sık Sorulan Sorular
                        </h1>
                        <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
                            İzin süreçleriyle ilgili en sık gelen soruları ve kısa cevaplarını burada bulabilirsiniz.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="mt-16 flex flex-col items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
                        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Sorular yükleniyor...
                        </p>
                    </div>
                ) : faqList.length > 0 ? (
                    <div className="reveal reveal-2 mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
                        {faqList.map((item, index) => (
                            <article
                                key={item.id}
                                className="group rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_14px_36px_-24px_rgba(2,6,23,0.5)] backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-22px_rgba(14,116,144,0.45)] dark:border-slate-800 dark:bg-slate-900/70"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-[0_8px_18px_-8px_rgba(2,132,199,0.9)]">
                                        <CircleQuestionMark className="h-4 w-4" />
                                    </span>
                                    <h2 className="text-base font-extrabold leading-tight pt-1.5 text-slate-900 dark:text-slate-100 sm:text-lg">
                                        {item.question}
                                    </h2>
                                </div>

                                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                    {item.answer}
                                </p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 rounded-3xl border border-dashed border-slate-300 bg-white/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
                        <p className="text-slate-500 dark:text-slate-400">
                            Şu an için gösterilecek bir soru bulunmuyor.
                        </p>
                    </div>
                )}
                
            </div>
        </div>
    );
}