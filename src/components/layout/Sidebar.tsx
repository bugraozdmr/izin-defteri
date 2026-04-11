import Link from "next/link";

export default function Sidebar() {
	return (
		<aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
			<div className="p-4">
				<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
					<div className="text-sm font-semibold text-gray-900">Hızlı İşlemler</div>
					<div className="mt-3 flex flex-col gap-2">
						<Link
							href="/izin-talebi-olustur"
							className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
						>
							İzin Talebi Oluştur
						</Link>
						<Link
							href="/sorgula"
							className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
						>
							Sorgula
						</Link>
					</div>
				</div>
			</div>
		</aside>
	);
}

