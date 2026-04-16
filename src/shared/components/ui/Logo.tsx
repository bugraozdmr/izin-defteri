import { PlaneTakeoff } from "lucide-react";

type LogoProps = {
	size?: number;
	className?: string;
	title?: string;
};

export default function Logo({
	size = 36,
	className = "",
	title = "Logo",
}: LogoProps) {
	return (
		<span
			className={
				"relative inline-flex items-center justify-center rounded-2xl bg-gray-900 text-white " +
				"ring-1 ring-gray-900/10 " +
				className
			}
			style={{ width: size, height: size }}
			aria-label={title}
			role="img"
		>
			<span className="pointer-events-none absolute inset-0 rounded-2xl bg-white/5" />

			<svg
				className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-white/40"
				width={Math.max(10, Math.floor(size * 0.28))}
				height={Math.max(10, Math.floor(size * 0.28))}
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M4 16c4-6 10-8 16-8"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<path
					d="M5 19c4-4 9-6 15-6"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					opacity="0.7"
				/>
			</svg>

			<PlaneTakeoff
				className="relative"
				style={{ width: Math.floor(size * 0.62), height: Math.floor(size * 0.62) }}
				strokeWidth={1.7}
				aria-hidden="true"
			/>
		</span>
	);
}

