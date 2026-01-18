import React from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Landing from "./pages/Landing";
import DrocsidApp from "./pages/DrocsidApp";
import { AuthProvider } from "./auth/auth";

const googleClientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

if (!googleClientId) {
	throw new Error("Brakuje zmiennej środowiskowej VITE_GOOGLE_OAUTH_CLIENT_ID");
}

const linkClass = ({ isActive }: { isActive: boolean }) => `px-3 py-2 rounded-xl transition hover:bg-slate-100 ${isActive ? "bg-slate-200 font-medium" : ""}`;

function AppShell() {
	const location = useLocation();
	const isDrocsidRoute = location.pathname.startsWith("/app");

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
			{!isDrocsidRoute && (
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
			)}

			<Routes>
				<Route
					path="/"
					element={
						<main className="max-w-6xl mx-auto p-6 flex-1">
							<Landing />
						</main>
					}
				/>
				<Route
					path="/app"
					element={
						<main className="flex-1 flex">
							<DrocsidApp />
						</main>
					}
				/>
			</Routes>

			{!isDrocsidRoute && <footer className="text-center text-sm text-slate-500 py-6">© {new Date().getFullYear()} drocsid</footer>}
		</div>
	);
}

export default function App() {
	return (
		<GoogleOAuthProvider clientId={googleClientId}>
			<AuthProvider>
				<BrowserRouter>
					<AppShell />
				</BrowserRouter>
			</AuthProvider>
		</GoogleOAuthProvider>
	);
}
