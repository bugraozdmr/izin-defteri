import { MousePointer2, ClipboardEdit, Download } from "lucide-react";

export const STEPS = [
    {
      step: "01",
      title: "Talep Başlat",
      desc: "Sistem üzerinden yeni izin formu oluşturma ekranına geçiş yapın.",
      icon: MousePointer2,
      link: "/izin-talebi-olustur",
      buttonText: "Forma Git",
      accent: "from-sky-500 to-cyan-500",
      bg: "bg-sky-50/80 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800/70",
    },
    {
      step: "02",
      title: "Veri Girişi",
      desc: "İzin türü, başlangıç ve bitiş tarihlerini sisteme tanımlayın.",
      icon: ClipboardEdit,
      accent: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50/80 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/70",
    },
    {
      step: "03",
      title: "PDF Çıktı",
      desc: "Sistem tarafından hazırlanan resmi dilekçeyi PDF olarak indirin.",
      icon: Download,
      accent: "from-amber-500 to-orange-500",
      bg: "bg-amber-50/80 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/70",
    },
];