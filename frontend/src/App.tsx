import React from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Landing from "./pages/Landing";
import Charts from "./pages/Charts";
import Analysis from "./pages/Analysis";
import Login from "./pages/Login";

// do przeniesienia do .env
const VITE_GOOGLE_CLIENT_ID = "494375853488-nu5h6bsffjafo3s2srddijrgstqvs7nc.apps.googleusercontent.com";

const linkClass = ({ isActive }: { isActive: boolean }) => `px-3 py-2 rounded-xl transition hover:bg-slate-100 ${isActive ? "bg-slate-200 font-medium" : ""}`;

export default function App() {
	return (
		<GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>
			<BrowserRouter>
				<div className="min-h-screen bg-slate-50 text-slate-900">
					<header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
						<nav className="max-w-5xl mx-auto flex gap-2 p-4">
							<NavLink to="/" className={linkClass} end>
								Landing
							</NavLink>
							<NavLink to="/wykresy" className={linkClass}>
								Wykresy
							</NavLink>
							<NavLink to="/analiza" className={linkClass}>
								Analiza
							</NavLink>
							<div className="flex-1" />
							<NavLink to="/login" className={linkClass}>
								Login
							</NavLink>
						</nav>
					</header>

					<main className="max-w-5xl mx-auto p-6">
						<Routes>
							<Route path="/" element={<Landing />} />
							<Route path="/wykresy" element={<Charts />} />
							<Route path="/analiza" element={<Analysis />} />
							<Route path="/login" element={<Login />} />
						</Routes>
					</main>

					<footer className="text-center text-sm text-slate-500 py-6">© {new Date().getFullYear()} app</footer>
				</div>
			</BrowserRouter>
		</GoogleOAuthProvider>
	);
}
