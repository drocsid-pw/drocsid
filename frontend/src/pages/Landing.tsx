import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../auth/auth";

export default function Landing() {
	const navigate = useNavigate();
	const { setToken, isAuthenticated, payload, callerId } = useAuth();

	const colors = [
		{ name: "Blurple", hex: "#5865F2", desc: "Akcent, CTA, linki" },
		{ name: "Success", hex: "#57F287", desc: "Potwierdzenia, status online" },
		{ name: "Sun", hex: "#FEE75C", desc: "Ostrzeżenia, badge" },
		{ name: "Danger", hex: "#ED4245", desc: "Błędy, destructive" },
		{ name: "Slate 900", hex: "#0f172a", desc: "Tło dark / header" },
	];

	const handleGoogleSuccess = (response: CredentialResponse) => {
		if (!response.credential) {
			console.error("Brak tokenu ID z Google");
			return;
		}

		setToken(response.credential);
		navigate("/app");
	};

	const handleGoogleError = () => {
		console.error("Logowanie Google nie powiodło się");
	};

	return (
		<section className="grid gap-8">
			<div className="rounded-3xl overflow-hidden border shadow-sm">
				<div className="bg-[#5865F2] text-white px-8 py-10">
					<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">drocsid</h1>
					<p className="mt-3 max-w-2xl text-white/90">Oto Drocsid - klon Discorda. Teraz podpięty pod backend REST.</p>

					<div className="mt-6 flex flex-wrap items-center gap-3">
						<Link to="/app" className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition">
							Otwórz drocsida
						</Link>

						{isAuthenticated ? (
							<div className="text-sm text-white/90">
								Zalogowany jako <span className="font-semibold">{payload?.name ?? "user"}</span>
								{callerId ? <span className="ml-2 text-white/70">(id: {callerId})</span> : null}
							</div>
						) : (
							<GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
						)}
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
						{["Layout prosto od Discorda", "Core w Elixirze (docelowo)", "Front gada z REST-em"].map((t) => (
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
					<Link to="/app" className="px-5 py-2.5 rounded-xl bg-[#5865F2] text-white hover:bg-[#4c57d6] transition">
						Otwórz drocsida
					</Link>
				</div>
			</div>
		</section>
	);
}
