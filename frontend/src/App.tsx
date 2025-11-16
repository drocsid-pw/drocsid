import React from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import DrocsidApp from "./pages/DrocsidApp";

const linkClass = ({ isActive }: { isActive: boolean }) => `px-3 py-2 rounded-xl transition hover:bg-slate-100 ${isActive ? "bg-slate-200 font-medium" : ""}`;

export default function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-slate-50 text-slate-900">
				<header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
					<nav className="max-w-6xl mx-auto flex gap-2 p-4">
						<NavLink to="/" className={linkClass} end>
							Landing
						</NavLink>
						<NavLink to="/app" className={linkClass}>
							App
						</NavLink>
					</nav>
				</header>

				<main className="max-w-6xl mx-auto p-6">
					<Routes>
						<Route path="/" element={<Landing />} />
						<Route path="/app" element={<DrocsidApp />} />
					</Routes>
				</main>

				<footer className="text-center text-sm text-slate-500 py-6">© {new Date().getFullYear()} drocsid</footer>
			</div>
		</BrowserRouter>
	);
}
