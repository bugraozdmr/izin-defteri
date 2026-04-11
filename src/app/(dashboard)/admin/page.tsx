import { 
  Users, 
  ClipboardCheck, 
  CalendarClock, 
  UserMinus, 
  ArrowUpRight,
  ChevronRight, 
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = [
    { name: "Toplam Personel", value: "42", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Bekleyen Talepler", value: "8", icon: CalendarClock, iconColor: "text-amber-600", bg: "bg-amber-50" },
    { name: "Bugün İzinli", value: "5", icon: UserMinus, iconColor: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Bu Ay Kullanılan", value: "124 Gün", icon: ClipboardCheck, iconColor: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hoş Geldin, Buğra</h1>
        <p className="text-sm text-gray-500 mt-1">Sistemdeki son durum ve bekleyen işlemler aşağıdadır.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`rounded-2xl ${stat.bg} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor || "text-blue-600"}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="h-3 w-3" />
                %12
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        <div className="lg:col-span-8 rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Son İzin Talepleri</h3>
            <Link href="/admin/talepler" className="text-xs font-bold text-blue-600 hover:underline">Tümünü Gör</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4">Personel</th>
                  <th className="px-6 py-4">Tür / Tarih</th>
                  <th className="px-6 py-4">Süre</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {[1, 2, 3].map((item) => (
                  <tr key={item} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">AÖ</div>
                        <div>
                          <div className="font-bold text-gray-900 text-xs">Ahmet Öztürk</div>
                          <div className="text-[10px] text-gray-500">Sicil: 10234</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-700 text-xs">Yıllık İzin</div>
                      <div className="text-[10px] text-gray-400">12 - 15 Nis 2026</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-xs">3 Gün</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 border border-amber-100">
                        Bekliyor
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-bold text-xs">Detay</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div className="grid gap-3">
              <button className="flex items-center justify-between w-full p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group">
                <span className="text-xs font-bold">Yeni Personel Ekle</span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </button>
              <button className="flex items-center justify-between w-full p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group">
                <span className="text-xs font-bold">Toplu Tatil Tanımla</span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </button>
              <button className="flex items-center justify-between w-full p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group">
                <span className="text-xs font-bold">Yıllık Rapor Al</span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-gray-900 p-6 text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Sistem Notu</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Nisan ayı izin talepleri geçen aya göre %20 artış gösterdi. Onay bekleyen 8 formun süresi 24 saati geçti.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-24 w-24 text-white" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}