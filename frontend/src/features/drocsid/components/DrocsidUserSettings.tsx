import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { DrocsidUser } from "../types";
import { getInitialDrocsidThemeKey, useDrocsidTheme } from "../theme-provider";
import { useDrocsidApi } from "../../../api/useDrocsidApi";
import { isDrocsidApiError } from "../../../api/http";
import { mapUserDto } from "../mappers";
import { useAuth } from "../../../auth/auth";

type DrocsidUserSettingsProps = {
	user: DrocsidUser;
	onUserUpdated: (user: DrocsidUser) => void;
	onClose: () => void;
};

type SectionKey = "account" | "appearance" | "friends";

function getErrorText(err: unknown): string {
	if (isDrocsidApiError(err)) {
		return `${err.code}: ${err.message}`;
	}
	if (err instanceof Error) {
		return err.message;
	}
	return "Unknown error";
}

function normalizeName(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

function isValidDisplayName(value: string): boolean {
	return normalizeName(value).length > 0;
}

type UiTokens = {
	panel: string;
	muted: string;
	label: string;
	input: string;
	navActive: string;
	navIdle: string;
	buttonPrimary: string;
	buttonGhost: string;
	box: string;
	border: string;
	error: string;
};

function useUiTokens(isDark: boolean): UiTokens {
	return useMemo(() => {
		if (isDark) {
			return {
				panel: "bg-[#1a1a1e] text-slate-100",
				muted: "text-slate-400",
				label: "text-slate-200",
				input: "bg-[#222327] border-[#212124] text-slate-100 placeholder:text-slate-500",
				navActive: "bg-slate-100 text-slate-900",
				navIdle: "hover:bg-white/10 text-slate-200",
				buttonPrimary: "bg-slate-100 text-slate-900 hover:bg-white",
				buttonGhost: "border-[#212124] text-slate-200 hover:bg-white/10",
				box: "bg-white/5 border-[#212124] text-slate-200",
				border: "border-[#212124]",
				error: "text-red-300",
			};
		}

		return {
			panel: "bg-white text-slate-900",
			muted: "text-slate-500",
			label: "text-slate-700",
			input: "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
			navActive: "bg-slate-900 text-white",
			navIdle: "hover:bg-slate-100 text-slate-700",
			buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800",
			buttonGhost: "border-slate-200 text-slate-700 hover:bg-slate-50",
			box: "bg-slate-50 border-slate-200 text-slate-700",
			border: "border-slate-200",
			error: "text-red-600",
		};
	}, [isDark]);
}

function avatarInitial(name: string): string {
	const trimmed = normalizeName(name);
	return trimmed ? trimmed[0]!.toUpperCase() : "?";
}

export function DrocsidUserSettings(props: DrocsidUserSettingsProps) {
	/**
	 * Production-ready user settings panel:
	 * - account: edit display name and (optionally) advanced avatar identifier
	 * - appearance: local theme toggle (instant apply)
	 * - friends: placeholder for invite flow (backend not wired yet)
	 */
	const { user, onUserUpdated, onClose } = props;

	const api = useDrocsidApi();
	const { callerId, payload, clearToken } = useAuth();
	const { themeKey, setThemeKey, isDark } = useDrocsidTheme();

	const ui = useUiTokens(isDark);

	const [activeSection, setActiveSection] = useState<SectionKey>("account");

	const [displayName, setDisplayName] = useState(user.name);
	const [avatarHash, setAvatarHash] = useState(user.avatarHash);
	const [showAdvanced, setShowAdvanced] = useState(false);

	const [inviteValue, setInviteValue] = useState("");

	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setDisplayName(user.name);
		setAvatarHash(user.avatarHash);
		setShowAdvanced(false);
		setError(null);
	}, [user.id]);

	const normalizedDraftName = useMemo(() => normalizeName(displayName), [displayName]);
	const normalizedUserName = useMemo(() => normalizeName(user.name), [user.name]);

	const isDirtyAccount = useMemo(() => {
		return normalizedDraftName !== normalizedUserName || avatarHash !== user.avatarHash;
	}, [normalizedDraftName, normalizedUserName, avatarHash, user.avatarHash]);

	const canSaveAccount = useMemo(() => {
		if (!callerId || !api) return false;
		if (isSaving) return false;
		if (!isDirtyAccount) return false;
		return isValidDisplayName(displayName);
	}, [callerId, api, isSaving, isDirtyAccount, displayName]);

	const handleSaveAccount = useCallback(
		async (event: React.FormEvent) => {
			event.preventDefault();
			setError(null);

			if (!api || !callerId) {
				setError("Auth missing. Please sign in again.");
				return;
			}

			const name = normalizeName(displayName);
			if (!name) {
				setError("Display name is required.");
				return;
			}

			setIsSaving(true);

			try {
				const dto = await api.putUser(callerId, {
					name,
					avatarHash: avatarHash.trim(),
				});

				const next = mapUserDto(dto, { id: callerId, name: payload?.name ?? undefined });
				onUserUpdated(next);
				onClose();
			} catch (e) {
				setError(getErrorText(e));
			} finally {
				setIsSaving(false);
			}
		},
		[api, callerId, displayName, avatarHash, payload?.name, onUserUpdated, onClose]
	);

	const resetAccountDraft = useCallback(() => {
		setDisplayName(user.name);
		setAvatarHash(user.avatarHash);
		setShowAdvanced(false);
		setError(null);
	}, [user.name, user.avatarHash]);

	const resetAppearanceToDefault = useCallback(() => {
		setThemeKey(getInitialDrocsidThemeKey());
	}, [setThemeKey]);

	const email = payload?.email ?? null;
	const picture = payload?.picture ?? null;

	const canInviteFriends = false;

	const header = (
		<header className="mb-4">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="text-lg font-semibold">User settings</h2>
					<p className={`text-xs mt-1 ${ui.muted}`}>Manage your profile and preferences.</p>
				</div>

				<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={onClose} disabled={isSaving}>
					Close
				</button>
			</div>

			{error && <div className={`mt-3 text-xs ${ui.error}`}>{error}</div>}
		</header>
	);

	const nav = (
		<nav className={`w-56 shrink-0 border-r pr-4 ${ui.border}`}>
			<ul className="space-y-1 text-sm">
				<li>
					<button
						type="button"
						onClick={() => setActiveSection("account")}
						className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "account" ? ui.navActive : ui.navIdle}`}>
						Account
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() => setActiveSection("appearance")}
						className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "appearance" ? ui.navActive : ui.navIdle}`}>
						Appearance
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() => setActiveSection("friends")}
						className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "friends" ? ui.navActive : ui.navIdle}`}>
						Friends
					</button>
				</li>
			</ul>

			<div className={`mt-6 pt-4 border-t ${ui.border}`}>
				<button type="button" className={`w-full px-3 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={() => clearToken()} disabled={isSaving}>
					Sign out
				</button>
			</div>
		</nav>
	);

	const accountSection = (
		<form className="flex-1 flex flex-col gap-6 overflow-auto" onSubmit={handleSaveAccount}>
			<section className={`rounded-2xl border p-4 ${ui.border}`}>
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl grid place-items-center text-lg font-semibold" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)" }}>
						{picture ? (
							<img src={picture} alt="" className="w-12 h-12 rounded-2xl object-cover" />
						) : (
							<span>{avatarInitial(user.name)}</span>
						)}
					</div>

					<div className="min-w-0">
						<div className="font-semibold truncate">{user.name}</div>
						{email ? <div className={`text-xs ${ui.muted} truncate`}>{email}</div> : <div className={`text-xs ${ui.muted}`}>Signed in</div>}
					</div>
				</div>

				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						<span className={`font-medium ${ui.label}`}>Display name</span>
						<input
							value={displayName}
							onChange={(event) => setDisplayName(event.target.value)}
							disabled={isSaving}
							className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
							placeholder="Your name"
						/>
						<span className={`text-xs ${ui.muted}`}>This will be visible to others.</span>
					</label>

					<div className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Status</span>
						<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>Online</div>
						<span className={`text-xs ${ui.muted}`}>Presence will be wired later.</span>
					</div>

					<div className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Account</span>
						<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>{email ?? "Google sign-in"}</div>
						<span className={`text-xs ${ui.muted}`}>Authentication provider.</span>
					</div>
				</div>
			</section>

			<section className={`rounded-2xl border p-4 ${ui.border}`}>
				<div className="flex items-center justify-between gap-4">
					<div>
						<div className="text-sm font-semibold">Advanced</div>
						<div className={`text-xs mt-1 ${ui.muted}`}>Only if you know what you are doing.</div>
					</div>

					<button type="button" className={`px-3 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={() => setShowAdvanced((v) => !v)} disabled={isSaving}>
						{showAdvanced ? "Hide" : "Show"}
					</button>
				</div>

				{showAdvanced && (
					<div className="mt-4 grid gap-4">
						<label className="flex flex-col gap-1 text-sm">
							<span className={`font-medium ${ui.label}`}>Avatar identifier</span>
							<input
								value={avatarHash}
								onChange={(event) => setAvatarHash(event.target.value)}
								disabled={isSaving}
								className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
								placeholder="Optional"
							/>
							<span className={`text-xs ${ui.muted}`}>Temporary field until proper upload is implemented.</span>
						</label>
					</div>
				)}
			</section>

			<div className={`border-t pt-4 mt-auto flex justify-between gap-3 ${ui.border}`}>
				<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={resetAccountDraft} disabled={isSaving}>
					Reset
				</button>

				<button type="submit" className={`px-4 py-2 text-sm rounded-lg transition ${ui.buttonPrimary}`} disabled={!canSaveAccount}>
					{isSaving ? "Saving..." : "Save changes"}
				</button>
			</div>
		</form>
	);

	const appearanceSection = (
		<div className="flex-1 flex flex-col gap-6 overflow-auto">
			<section className={`rounded-2xl border p-4 ${ui.border}`}>
				<div className="text-sm font-semibold">Theme</div>
				<div className={`text-xs mt-1 ${ui.muted}`}>Applies instantly on this device.</div>

				<div className="mt-4 space-y-2">
					<label className="flex items-center gap-2 text-sm">
						<input type="radio" name="theme" value="dark" checked={themeKey === "dark"} onChange={() => setThemeKey("dark")} className="h-4 w-4" />
						<span>Dark</span>
					</label>
					<label className="flex items-center gap-2 text-sm">
						<input type="radio" name="theme" value="light" checked={themeKey === "light"} onChange={() => setThemeKey("light")} className="h-4 w-4" />
						<span>Light</span>
					</label>
				</div>

				<div className="mt-4">
					<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={resetAppearanceToDefault}>
						Use default
					</button>
				</div>
			</section>
		</div>
	);

	const friendsSection = (
		<div className="flex-1 flex flex-col gap-6 overflow-auto">
			<section className={`rounded-2xl border p-4 ${ui.border}`}>
				<div className="text-sm font-semibold">Invite a friend</div>
				<div className={`text-xs mt-1 ${ui.muted}`}>
					This will be enabled when the backend exposes an invite endpoint (code or link).
				</div>

				<div className="mt-4 flex flex-col gap-2">
					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Invite code / email</span>
						<input
							value={inviteValue}
							onChange={(event) => setInviteValue(event.target.value)}
							disabled={!canInviteFriends}
							className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
							placeholder="e.g. john@example.com or INVITE-123"
						/>
					</label>

					<div className="flex justify-end">
						<button type="button" className={`px-4 py-2 text-sm rounded-lg transition ${ui.buttonPrimary}`} disabled>
							Send invite
						</button>
					</div>

					<div className={`text-xs ${ui.muted}`}>
						Backend status: not wired yet.
					</div>
				</div>
			</section>
		</div>
	);

	const content = activeSection === "account" ? accountSection : activeSection === "appearance" ? appearanceSection : friendsSection;

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel} ${ui.border}`}>
			{header}

			<div className="flex-1 flex gap-6 overflow-hidden">
				{nav}
				{content}
			</div>
		</section>
	);
}
