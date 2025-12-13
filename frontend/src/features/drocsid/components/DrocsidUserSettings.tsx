import React, { useMemo, useState } from "react";
import { getInitialDrocsidThemeKey, useDrocsidTheme, DROCSID_THEME_STORAGE_KEY } from "../theme-provider";

type ProtoUpdateUserRequest = {
	caller_id: string;
	name: string;
	avatarHash: string;
};

export function DrocsidUserSettings() {
	const [activeSection, setActiveSection] = useState<"account" | "appearance">("account");

	const { themeKey, setThemeKey, isDark } = useDrocsidTheme();

	const currentUserId = "user-1";

	const [displayName, setDisplayName] = useState("Rafał");
	const [avatarHash, setAvatarHash] = useState("");

	const ui = useMemo(() => {
		return {
			panel: isDark ? "bg-[#1a1a1e] border-[#212124] text-slate-100" : "bg-white border-slate-200 text-slate-900",
			muted: isDark ? "text-slate-400" : "text-slate-500",
			label: isDark ? "text-slate-200" : "text-slate-700",
			input: isDark ? "bg-[#222327] border-[#212124] text-slate-100" : "bg-white border-slate-200 text-slate-900",
			navActive: isDark ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-white",
			navIdle: isDark ? "hover:bg-white/10 text-slate-200" : "hover:bg-slate-100 text-slate-700",
			buttonPrimary: isDark ? "bg-slate-100 text-slate-900 hover:bg-white" : "bg-slate-900 text-white hover:bg-slate-800",
			buttonGhost: isDark ? "border-[#212124] text-slate-200 hover:bg-white/10" : "border-slate-200 text-slate-700 hover:bg-slate-50",
			box: isDark ? "bg-white/5 border-[#212124] text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700",
		};
	}, [isDark]);

	const handleSave = (event: React.FormEvent) => {
		event.preventDefault();

		const payload: ProtoUpdateUserRequest = {
			caller_id: currentUserId,
			name: displayName.trim(),
			avatarHash: avatarHash.trim(),
		};

		alert(`UserService.UpdateUser(UpdateUserRequest)\n\n${JSON.stringify(payload, null, 2)}`);
	};

	const renderAccountSection = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Konto</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>user.User</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Nazwa</span>
						<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`} />
						<span className={`text-xs ${ui.muted}`}>user.name</span>
					</label>

					<div className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>User ID</span>
						<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>{currentUserId}</div>
						<span className={`text-xs ${ui.muted}`}>user.id</span>
					</div>

					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						<span className={`font-medium ${ui.label}`}>Avatar hash</span>
						<input
							value={avatarHash}
							onChange={(event) => setAvatarHash(event.target.value)}
							placeholder="(opcjonalnie)"
							className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
						/>
						<span className={`text-xs ${ui.muted}`}>user.avatarHash</span>
					</label>
				</div>
			</div>
		);
	};

	const renderAppearanceSection = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Wygląd</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>Lokalnie (frontend)</p>
				</div>

				<div className="space-y-3">
					<div className="flex flex-col gap-2">
						<label className="flex items-center gap-2 text-sm">
							<input type="radio" name="theme" value="dark" checked={themeKey === "dark"} onChange={() => setThemeKey("dark")} className="h-4 w-4" />
							<span>Tryb ciemny</span>
						</label>
						<label className="flex items-center gap-2 text-sm">
							<input type="radio" name="theme" value="light" checked={themeKey === "light"} onChange={() => setThemeKey("light")} className="h-4 w-4" />
							<span>Tryb jasny</span>
						</label>
					</div>

					<p className={`text-xs ${ui.muted}`}>{DROCSID_THEME_STORAGE_KEY}</p>
				</div>
			</div>
		);
	};

	const sectionContent = activeSection === "account" ? renderAccountSection() : renderAppearanceSection();

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel}`}>
			<header className="mb-4">
				<h2 className="text-lg font-semibold">Ustawienia użytkownika</h2>
				<p className={`text-xs mt-1 ${ui.muted}`}>UpdateUser: caller_id, name, avatarHash</p>
			</header>

			<div className="flex-1 flex gap-6 overflow-hidden">
				<nav className={`w-48 shrink-0 border-r pr-4 ${isDark ? "border-[#212124]" : "border-slate-200"}`}>
					<ul className="space-y-1 text-sm">
						<li>
							<button type="button" onClick={() => setActiveSection("account")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "account" ? ui.navActive : ui.navIdle}`}>
								Konto
							</button>
						</li>
						<li>
							<button type="button" onClick={() => setActiveSection("appearance")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "appearance" ? ui.navActive : ui.navIdle}`}>
								Wygląd
							</button>
						</li>
					</ul>
				</nav>

				<form className="flex-1 flex flex-col gap-6 overflow-auto" onSubmit={handleSave}>
					{sectionContent}

					<div className={`border-t pt-4 mt-auto flex justify-end gap-3 ${isDark ? "border-[#212124]" : "border-slate-200"}`}>
						<button
							type="button"
							className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`}
							onClick={() => {
								setDisplayName("Rafał");
								setAvatarHash("");
								setThemeKey(getInitialDrocsidThemeKey());
							}}>
							Przywróć
						</button>
						<button type="submit" className={`px-4 py-2 text-sm rounded-lg transition ${ui.buttonPrimary}`}>
							Zapisz
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}
