import React, { useMemo, useRef, useState } from "react";
import { useDrocsidTheme } from "../theme-provider";
import { PERMISSION_FLAGS, type PermissionFlag, permissionsStringToRecord, recordToPermissionsString, type PermissionsRecord } from "../permissions";
import type { RoleForm } from "../roles";
import { useDrocsidApi } from "../../../api/useDrocsidApi";
import { isDrocsidApiError } from "../../../api/http";

type DrocsidCreateServerProps = {
	onCancel: () => void;
	onCreated: (guildId: string) => void;
};

type ActiveSection = "general" | "roles";

function getErrorText(err: unknown): string {
	if (isDrocsidApiError(err)) {
		return `${err.code}: ${err.message}`;
	}
	if (err instanceof Error) {
		return err.message;
	}
	return "Unknown error";
}

function normalizeName(value: string | null | undefined): string {
	return (value ?? "").trim().toLowerCase();
}

function makeLocalId(suffix?: string): string {
	const base = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return suffix ? `${base}-${suffix}` : base;
}

function makeRoleForm(args: { roleName: string; permissions: string; system?: boolean }): RoleForm {
	return {
		guildRoleId: makeLocalId("role"),
		roleName: args.roleName,
		permissions: permissionsStringToRecord(args.permissions),
		isNew: true,
		system: args.system,
	};
}

function buildDefaultRoles(): RoleForm[] {
	return [
		makeRoleForm({
			roleName: "Admin",
			permissions: "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|MANAGE_GUILD|READ|WRITE",
		}),
		makeRoleForm({
			roleName: "Moderator",
			permissions: "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|READ|WRITE",
		}),
	];
}

function validateRoles(roles: RoleForm[]): { ok: true } | { ok: false; message: string } {
	const cleaned = roles
		.map((r) => r.roleName.trim())
		.filter((name) => name.length > 0);

	if (cleaned.length === 0) {
		return { ok: true };
	}

	const seen = new Set<string>();
	for (const name of cleaned) {
		const key = name.toLowerCase();
		if (seen.has(key)) {
			return { ok: false, message: `Role names must be unique. Duplicate: "${name}".` };
		}
		seen.add(key);
	}

	return { ok: true };
}

function buildRoleCreates(roles: RoleForm[]): Array<{ roleName: string; permissions: string }> {
	return roles
		.map((r) => ({
			roleName: r.roleName.trim(),
			permissions: recordToPermissionsString(r.permissions),
		}))
		.filter((r) => r.roleName.length > 0);
}

function emptyPermissionsPreview(record: PermissionsRecord): boolean {
	return PERMISSION_FLAGS.every((flag) => !record[flag]);
}

export function DrocsidCreateServer(props: DrocsidCreateServerProps) {
	/**
	 * Create Server flow:
	 * - creates a guild (name + icon)
	 * - creates initial roles
	 * - ensures general channel exists
	 */
	const { onCancel, onCreated } = props;

	const api = useDrocsidApi();
	const { isDark } = useDrocsidTheme();

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
			buttonDanger: isDark ? "border-red-900/40 text-red-200 hover:bg-red-500/10" : "border-red-200 text-red-700 hover:bg-red-50",
			border: isDark ? "border-[#212124]" : "border-slate-200",
			tableHead: isDark ? "bg-white/5" : "bg-slate-50",
			tableRowHover: isDark ? "hover:bg-white/5" : "hover:bg-slate-50",
			box: isDark ? "bg-white/5 border-[#212124] text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700",
		};
	}, [isDark]);

	const submitLockRef = useRef(false);

	const [activeSection, setActiveSection] = useState<ActiveSection>("general");

	const [guildName, setGuildName] = useState("New server");
	const [guildIcon, setGuildIcon] = useState("✨");

	const [roles, setRoles] = useState<RoleForm[]>(() => buildDefaultRoles());

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleAddRole = () => {
		const baseName = "New role";
		let index = 1;

		const existing = new Set(roles.map((r) => r.roleName.trim().toLowerCase()).filter(Boolean));
		let candidate = baseName;

		while (existing.has(candidate.toLowerCase())) {
			index += 1;
			candidate = `${baseName} ${index}`;
		}

		setRoles((current) => [
			...current,
			{
				guildRoleId: makeLocalId("role"),
				roleName: candidate,
				permissions: permissionsStringToRecord("READ|WRITE"),
				isNew: true,
			},
		]);
	};

	const handleRemoveRole = (roleId: string) => {
		setRoles((current) => current.filter((r) => r.guildRoleId !== roleId));
	};

	const handleRenameRole = (roleId: string, newName: string) => {
		setRoles((current) => current.map((r) => (r.guildRoleId === roleId ? { ...r, roleName: newName } : r)));
	};

	const handleToggleRolePermission = (roleId: string, flag: PermissionFlag) => {
		setRoles((current) =>
			current.map((r) => {
				if (r.guildRoleId !== roleId) {
					return r;
				}
				return { ...r, permissions: { ...r.permissions, [flag]: !r.permissions[flag] } };
			})
		);
	};

	const ensureGeneralChannel = async (guildId: string) => {
		if (!api) {
			return;
		}

		const list = await api.getAllChannels(guildId);
		const exists = (list.channels ?? []).some((ch) => normalizeName(ch.name) === "general");

		if (!exists) {
			await api.createChannel(guildId, "general");
		}
	};

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);

		if (submitLockRef.current) {
			return;
		}

		if (!api) {
			setError("Missing API (auth). Please sign in again.");
			return;
		}

		const name = guildName.trim();
		if (!name) {
			setError("Server name is required.");
			return;
		}

		const rolesValidation = validateRoles(roles);
		if (!rolesValidation.ok) {
			setError(rolesValidation.message);
			return;
		}

		submitLockRef.current = true;
		setIsSubmitting(true);

		try {
			const icon = guildIcon.trim() || "✨";
			const createdGuild = await api.createGuild({ name, icon });
			const guildId = createdGuild.guildId ?? "";

			if (!guildId) {
				throw new Error("Backend did not return guildId");
			}

			const roleCreates = buildRoleCreates(roles);
			await Promise.all(roleCreates.map((r) => api.createRole(guildId, r)));

			await ensureGeneralChannel(guildId);

			onCreated(guildId);
		} catch (e) {
			setError(getErrorText(e));
		} finally {
			setIsSubmitting(false);
			submitLockRef.current = false;
		}
	};

	const renderGeneralSection = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">General</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>Basic server info.</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Name</span>
						<input
							value={guildName}
							onChange={(event) => setGuildName(event.target.value)}
							className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
							placeholder="e.g. My server"
						/>
					</label>

					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Icon</span>
						<input
							value={guildIcon}
							onChange={(event) => setGuildIcon(event.target.value)}
							className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
							placeholder="✨"
						/>
						<span className={`text-xs ${ui.muted}`}>Emoji works best for now.</span>
					</label>
				</div>
			</div>
		);
	};

	const renderRolesSection = () => {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between gap-2">
					<div>
						<h3 className="text-sm font-semibold">Initial roles</h3>
						<p className={`text-xs mt-1 ${ui.muted}`}>Optional. You can always change roles later.</p>
					</div>
					<button type="button" onClick={handleAddRole} className={`px-3 py-1.5 text-xs rounded-lg transition ${ui.buttonPrimary}`}>
						Add role
					</button>
				</div>

				<div className={`overflow-auto border rounded-xl ${ui.border}`}>
					<table className="min-w-full text-xs">
						<thead className={`${ui.tableHead} border-b ${ui.border}`}>
							<tr>
								<th className={`text-left px-3 py-2 font-medium w-56 ${ui.label}`}>Role</th>
								{PERMISSION_FLAGS.map((flag) => (
									<th key={flag} className={`text-left px-3 py-2 font-medium ${ui.label}`}>
										{flag}
									</th>
								))}
								<th className={`text-left px-3 py-2 font-medium ${ui.label}`}>Preview</th>
								<th className={`text-left px-3 py-2 font-medium ${ui.label}`}></th>
							</tr>
						</thead>

						<tbody>
							{roles.map((role) => {
								const preview = recordToPermissionsString(role.permissions);
								const isEmpty = emptyPermissionsPreview(role.permissions);

								return (
									<tr key={role.guildRoleId} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
										<td className="px-3 py-2 align-top">
											<input
												value={role.roleName}
												onChange={(event) => handleRenameRole(role.guildRoleId, event.target.value)}
												className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
												placeholder="Role name"
											/>
										</td>

										{PERMISSION_FLAGS.map((flag) => (
											<td key={flag} className="px-3 py-2 text-center align-middle">
												<label className="inline-flex items-center justify-center" title={flag}>
													<input
														type="checkbox"
														checked={role.permissions[flag]}
														onChange={() => handleToggleRolePermission(role.guildRoleId, flag)}
														className="h-4 w-4"
													/>
												</label>
											</td>
										))}

										<td className="px-3 py-2 align-middle">
											<div className={`px-2 py-1 rounded border text-[11px] ${ui.box}`}>{isEmpty ? "-" : preview}</div>
										</td>

										<td className="px-3 py-2 align-middle">
											<button
												type="button"
												onClick={() => handleRemoveRole(role.guildRoleId)}
												className={`px-2 py-1 rounded-lg border text-[11px] transition ${ui.buttonDanger}`}
												title="Remove role">
												Remove
											</button>
										</td>
									</tr>
								);
							})}

							{roles.length === 0 && (
								<tr>
									<td colSpan={PERMISSION_FLAGS.length + 3} className={`px-3 py-6 text-sm ${ui.muted}`}>
										No roles yet. You can add them now or later.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className={`text-[11px] ${ui.muted}`}>
					System roles (like @owner/@everyone) are typically created by the backend. Here you define user roles only.
				</div>
			</div>
		);
	};

	const sectionContent = activeSection === "general" ? renderGeneralSection() : renderRolesSection();

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel}`}>
			<header className="mb-4">
				<h2 className="text-lg font-semibold">Create server</h2>
				<p className={`text-xs mt-1 ${ui.muted}`}>Set up a new guild with optional initial roles.</p>

				{error && <div className="mt-3 text-xs text-red-400">{error}</div>}
			</header>

			<div className="flex-1 flex gap-6 overflow-hidden">
				<nav className={`w-48 shrink-0 border-r pr-4 ${ui.border}`}>
					<ul className="space-y-1 text-sm">
						<li>
							<button
								type="button"
								onClick={() => setActiveSection("general")}
								className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "general" ? ui.navActive : ui.navIdle}`}>
								General
							</button>
						</li>
						<li>
							<button
								type="button"
								onClick={() => setActiveSection("roles")}
								className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "roles" ? ui.navActive : ui.navIdle}`}>
								Roles
							</button>
						</li>
					</ul>
				</nav>

				<form className="flex-1 flex flex-col gap-6 overflow-auto" onSubmit={handleCreate}>
					{sectionContent}

					<div className={`border-t pt-4 mt-auto flex justify-end gap-3 ${ui.border}`}>
						<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={onCancel} disabled={isSubmitting}>
							Cancel
						</button>
						<button type="submit" className={`px-4 py-2 text-sm rounded-lg transition ${ui.buttonPrimary}`} disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create"}
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}
