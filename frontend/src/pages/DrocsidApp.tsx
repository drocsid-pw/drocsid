import React from "react";

export default function DrocsidApp() {
	const servers = ["🏡", "💻", "🎮", "🎨", "🎧", "🧪"];
	const channels = [
		{ id: 1, name: "general" },
		{ id: 2, name: "dev" },
		{ id: 3, name: "design" },
		{ id: 4, name: "random" },
	];
	const messages = [
		{ id: 1, user: "Rafał", time: "09:12", text: "Siemano, oceniaj design" },
		{ id: 2, user: "Twój stary", time: "09:13", text: "Ej zajebisty drocsid" },
		{ id: 3, user: "Miron", time: "09:15", text: "No i git. Kuba rób elixira" },
	];

	return (
		<section className="rounded-3xl overflow-hidden border shadow-sm">
			<div className="grid grid-cols-[64px_280px_1fr] h-[70vh] bg-slate-100">
				{/* 1) Pasek serwerów */}

				<aside className="bg-[#1f2335] text-white flex flex-col items-center gap-3 py-3">
					<div className="w-12 h-12 rounded-2xl bg-[#5865F2] grid place-items-center font-bold">d</div>
					<div className="w-8 h-px bg-white/10 my-2" />
					{servers.map((icon, i) => (
						<button key={i} className="w-12 h-12 rounded-2xl grid place-items-center bg-white/10 hover:bg-white/20 transition" title={`Server ${i + 1}`}>
							<span className="text-xl">{icon}</span>
						</button>
					))}
					<button className="mt-auto mb-1 w-12 h-12 rounded-2xl grid place-items-center bg-white/10 hover:bg-white/20 transition" title="Dodaj serwer">
						+
					</button>
				</aside>

				{/* 2) Lista kanałów */}

				<nav className="bg-[#23283d] text-slate-200 flex flex-col">
					<div className="px-4 py-3 border-b border-white/10 font-semibold tracking-wide">drocsid / server-1</div>

					<div className="p-3 space-y-1 overflow-auto">
						<div className="text-xs uppercase text-slate-400 px-2 py-1">Kanały tekstowe</div>
						{channels.map((c, idx) => (
							<button key={c.id} className={`w-full text-left px-3 py-2 rounded-lg transition ${idx === 0 ? "bg-white/10 text-white" : "hover:bg-white/5"}`} title={`#${c.name}`}>
								<span className="mr-1 text-slate-400">#</span>
								{c.name}
							</button>
						))}
					</div>

					<div className="mt-auto border-t border-white/10 px-3 py-3">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center">🧑</div>
							<div className="flex-1 leading-tight">
								<div className="text-sm">Rafał</div>
								<div className="text-xs text-slate-400">online</div>
							</div>
							<button className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20">Ustawienia</button>
						</div>
					</div>
				</nav>

				{/* 3) Obszar czatu */}

				<main className="bg-slate-50 grid grid-rows-[auto_1fr_auto]">
					{/* Header */}
					<div className="h-12 px-4 border-b bg-white flex items-center gap-3">
						<div className="text-slate-400">#</div>
						<div className="font-medium">general</div>
						<div className="ml-auto flex items-center gap-2 text-slate-500">
							<input placeholder="Szukaj…" className="text-sm px-3 py-1.5 rounded-lg border bg-white outline-none focus:ring-2 ring-[#5865F2]" />
						</div>
					</div>

					{/* Messages */}
					<div className="overflow-auto p-4 space-y-4">
						{messages.map((m) => (
							<div key={m.id} className="flex gap-3">
								<div className="w-10 h-10 rounded-full bg-slate-300 grid place-items-center">👤</div>
								<div className="flex-1">
									<div className="flex items-baseline gap-2">
										<span className="font-semibold">{m.user}</span>
										<span className="text-xs text-slate-500">{m.time}</span>
									</div>
									<div className="text-slate-700">{m.text}</div>
								</div>
							</div>
						))}
					</div>

					{/* Composer */}
					<form
						className="p-4 bg-white border-t"
						onSubmit={(e) => {
							e.preventDefault();
							alert("To jeszcze nie działa");
						}}>
						<div className="flex items-center gap-2">
							<input className="flex-1 px-4 py-3 rounded-2xl border bg-white outline-none focus:ring-2 ring-[#5865F2]" placeholder="Napisz wiadomość do #general…" />
							<button type="submit" className="px-4 py-3 rounded-2xl bg-[#5865F2] text-white hover:bg-[#4c57d6] transition">
								Wyślij
							</button>
						</div>
					</form>
				</main>
			</div>
		</section>
	);
}
