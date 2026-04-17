import { Edit2, EyeIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { User } from "@/features/user/constants";
import { UserTableRow } from "@/features/user/constants";

interface UserTableProps {
  users: UserTableRow[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onOpenForm: (user: User) => void;
}

export default function UserTable({ users = [], onEdit, onDelete, onOpenForm }: UserTableProps) {
  const formatDate = (dateValue: Date | null | string) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[860px] w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            <th className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">Adı Soyadı</th>
            <th className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">İş Unvanı</th>
            <th className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">İşe Giriş Tarihi</th>
            <th className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">Kalan İzin</th>
            <th className="px-3 py-3 whitespace-nowrap text-right sm:px-6 sm:py-4">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                Henüz kayıtlı bir personel bulunmuyor.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white sm:px-6 sm:py-4">
                  {user.fullName}
                </td>
                <td className="px-3 py-3 font-medium text-slate-600 dark:text-slate-400 sm:px-6 sm:py-4">
                  {user.jobTitle || "-"}
                </td>

                <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400 sm:px-6 sm:py-4">
                  {formatDate(user.hireDate)}
                </td>

                <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400 sm:px-6 sm:py-4">
                  {user.remainingDays !== undefined ? user.remainingDays : "-"} 
                </td>

                <td className="px-3 py-3 whitespace-nowrap text-right sm:px-6 sm:py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/personeller/${user.id}`}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-slate-500 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:text-slate-500 dark:hover:bg-sky-500/10 dark:hover:text-sky-400"
                      title="Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(user.id)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}