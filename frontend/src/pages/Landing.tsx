import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
	const colors = [
		{ name: "Blurple", hex: "#5865F2", desc: "Akcent, CTA, linki" },
		{ name: "Success", hex: "#57F287", desc: "Potwierdzenia, status online" },
		{ name: "Sun", hex: "#FEE75C", desc: "Ostrzeżenia, badge" },
		{ name: "Danger", hex: "#ED4245", desc: "Błędy, destructive" },
		{ name: "Slate 900", hex: "#0f172a", desc: "Tło dark / header" },
	];

	return (
		<section className="grid gap-8">
			<div className="rounded-3xl overflow-hidden border shadow-sm">
				<div className="bg-[#5865F2] text-white px-8 py-10">
					<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">drocsid</h1>
					<p className="mt-3 max-w-2xl text-white/90">Oto Drocsid - klon Discorda. Chcemy, żeby działał</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<Link to="/app" className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition">
							Otwórz demo drocsida
						</Link>

						{/* TODO: Tu wrzuć auth button */}
					</div>
				</div>

				<div className="bg-white px-8 py-6">
					<h2 className="text-xl font-semibold">Kolorystyka projektu</h2>
					<p className="text-slate-600 text-sm mt-1">1:1 kolorki od Discorda</p>

					<div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
						{colors.map((c) => (
							<div key={c.hex} className="rounded-2xl border overflow-hidden bg-white">
								<div className="h-20" style={{ backgroundColor: c.hex }} />
								<div className="p-4">
									<div className="font-medium">{c.name}</div>
									<div className="text-xs text-slate-500">{c.hex}</div>
									<div className="text-xs text-slate-600 mt-1">{c.desc}</div>
								</div>
							</div>
						))}
					</div>

					<div className="mt-6 grid md:grid-cols-3 gap-4">
						{["Layout prosto od Discorda", "Core napisany w Elixirze - jak oryginał", "Działa wysyłanie plików"].map((t) => (
							<div key={t} className="rounded-2xl border bg-white p-5 shadow-sm">
								<h3 className="font-semibold">{t}</h3>
								<p className="text-sm text-slate-600 mt-1">drocsid drocsid drocsid</p>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="rounded-3xl border bg-white p-6 shadow-sm">
				<div className="mt-4">
					<Link to="/app" className="px-5 py-2.5 rounded-xl bg-[#5865F2] text-white hover:bg-[#4c57d6] text-slate-900 hover:bg-slate-100 transition">
						Otwórz demo drocsida
					</Link>
				</div>
			</div>
		</section>
	);
}
