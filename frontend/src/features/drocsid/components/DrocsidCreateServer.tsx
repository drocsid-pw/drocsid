import React, { useMemo, useState } from "react";
import type { DrocsidGuild, DrocsidRole } from "../types";
import { useDrocsidTheme } from "../theme-provider";
import { PERMISSION_FLAGS, type PermissionFlag, permissionsStringToRecord, recordToPermissionsString } from "../permissions";
import { rolesToRoleForms, roleFormToDrocsidRole, type RoleForm } from "../roles";

type CreateGuildBody = {
	caller_id: string;
	name: string;
	icon: string;
};

type CreateRoleBody = {
	caller_id: string;
	roleName: string;
	permissions: string;
};

type DrocsidCreateServerProps = {
	callerId: string;
	onCancel: () => void;
	onCreated: (server: DrocsidGuild) => void;
};

function buildSystemRoles(guildId: string): DrocsidRole[] {
	return [
		{
			guildRoleId: `${guildId}-role-owner`,
			roleName: "@owner",
			permissions: "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|MANAGE_GUILD|READ|WRITE",
			system: true,
		},
		{
			guildRoleId: `${guildId}-role-everyone`,
			roleName: "@everyone",
			permissions: "READ|WRITE",
			system: true,
		},
	];
}

export function DrocsidCreateServer(props: DrocsidCreateServerProps) {
	const { callerId, onCancel, onCreated } = props;

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
			border: isDark ? "border-[#212124]" : "border-slate-200",
			tableHead: isDark ? "bg-white/5" : "bg-slate-50",
			tableRowHover: isDark ? "hover:bg-white/5" : "hover:bg-slate-50",
			box: isDark ? "bg-white/5 border-[#212124] text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700",
		};
	}, [isDark]);

	const [activeSection, setActiveSection] = useState<"general" | "roles">("general");

	const [guildName, setGuildName] = useState("Nowy serwer");
	const [guildIcon, setGuildIcon] = useState("✨");

	const [roles, setRoles] = useState<RoleForm[]>(() =>
		rolesToRoleForms([
			{
				guildRoleId: `tmp-${Date.now()}-admin`,
				roleName: "Admin",
				permissions: "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|MANAGE_GUILD|READ|WRITE",
			},
			{
				guildRoleId: `tmp-${Date.now()}-mod`,
				roleName: "Moderator",
				permissions: "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|READ|WRITE",
			},
		]).map((r) => ({ ...r, isNew: true }))
	);

	const handleAddRole = () => {
		const baseName = "Nowa rola";
		let index = 1;

		const existing = new Set(roles.map((r) => r.roleName.toLowerCase()));
		let candidate = baseName;
		while (existing.has(candidate.toLowerCase())) {
			index += 1;
			candidate = `${baseName} ${index}`;
		}

		setRoles((current) => [
			...current,
			{
				guildRoleId: `tmp-${Date.now()}`,
				roleName: candidate,
				permissions: permissionsStringToRecord("READ|WRITE"),
				isNew: true,
			},
		]);
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

	const handleCreate = (event: React.FormEvent) => {
		event.preventDefault();

		const newGuildId = `server-${Date.now()}`;

		const createGuildBody: CreateGuildBody = {
			caller_id: callerId,
			name: guildName.trim(),
			icon: guildIcon.trim(),
		};

		const createRoleBodies: CreateRoleBody[] = roles.map((r) => ({
			caller_id: callerId,
			roleName: r.roleName.trim(),
			permissions: recordToPermissionsString(r.permissions),
		}));

		const systemRoles = buildSystemRoles(newGuildId);
		const userRoles: DrocsidRole[] = roles.map((r, idx) => ({
			...roleFormToDrocsidRole(r),
			guildRoleId: `${newGuildId}-role-${idx + 1}`,
		}));

		const everyone = systemRoles.find((r) => r.roleName === "@everyone");
		const owner = systemRoles.find((r) => r.roleName === "@owner");

		const createdServer: DrocsidGuild = {
			guildId: newGuildId,
			name: guildName.trim(),
			icon: guildIcon.trim() || "✨",
			ownerId: callerId,
			roles: [...systemRoles, ...userRoles],
			channels: [
				{
					channelId: "general",
					name: "general",
					guildId: newGuildId,
					overrides: { roles: [] },
					messages: [],
				},
			],
			users: [
				{
					guildUserId: `${newGuildId}-user-${callerId}`,
					nick: "Ty",
					roles: { roles: [owner ?? systemRoles[0], everyone ?? systemRoles[1]] },
				},
			],
		};

		alert(["POST /api/guilds", JSON.stringify(createGuildBody, null, 2), "", `POST /api/guilds/${newGuildId}/roles (x${createRoleBodies.length})`, JSON.stringify(createRoleBodies, null, 2), "", "Symulacja: nowy guildId", newGuildId].join("\n"));

		onCreated(createdServer);
	};

	const renderGeneralSection = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Ogólne</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>POST /api/guilds</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Nazwa</span>
						<input value={guildName} onChange={(event) => setGuildName(event.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`} />
						<span className={`text-xs ${ui.muted}`}>name</span>
					</label>

					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Ikona</span>
						<input value={guildIcon} onChange={(event) => setGuildIcon(event.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`} />
						<span className={`text-xs ${ui.muted}`}>icon</span>
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
						<h3 className="text-sm font-semibold">Role startowe</h3>
						<p className={`text-xs mt-1 ${ui.muted}`}>POST /api/guilds/{`{guildId}`}/roles</p>
					</div>
					<button type="button" onClick={handleAddRole} className={`px-3 py-1.5 text-xs rounded-lg transition ${ui.buttonPrimary}`}>
						Dodaj rolę
					</button>
				</div>

				<div className={`overflow-auto border rounded-xl ${ui.border}`}>
					<table className="min-w-full text-xs">
						<thead className={`${ui.tableHead} border-b ${ui.border}`}>
							<tr>
								<th className={`text-left px-3 py-2 font-medium w-52 ${ui.label}`}>roleName</th>
								{PERMISSION_FLAGS.map((flag) => (
									<th key={flag} className={`text-left px-3 py-2 font-medium ${ui.label}`}>
										{flag}
									</th>
								))}
								<th className={`text-left px-3 py-2 font-medium ${ui.label}`}>permissions</th>
							</tr>
						</thead>

						<tbody>
							{roles.map((role) => (
								<tr key={role.guildRoleId} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
									<td className="px-3 py-2 align-top">
										<input
											value={role.roleName}
											onChange={(event) => handleRenameRole(role.guildRoleId, event.target.value)}
											className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
										/>
										<div className={`text-[10px] mt-1 ${ui.muted}`}>{role.guildRoleId}</div>
									</td>

									{PERMISSION_FLAGS.map((flag) => (
										<td key={flag} className="px-3 py-2 text-center align-middle">
											<label className="inline-flex items-center justify-center">
												<input type="checkbox" checked={role.permissions[flag]} onChange={() => handleToggleRolePermission(role.guildRoleId, flag)} className="h-4 w-4" />
											</label>
										</td>
									))}

									<td className="px-3 py-2 align-middle">
										<div className={`px-2 py-1 rounded border text-[11px] ${ui.box}`}>{recordToPermissionsString(role.permissions) || "-"}</div>
									</td>
								</tr>
							))}

							{roles.length === 0 && (
								<tr>
									<td colSpan={PERMISSION_FLAGS.length + 2} className={`px-3 py-6 text-sm ${ui.muted}`}>
										Brak ról.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className={`text-[11px] ${ui.muted}`}>@owner i @everyone zwykle tworzy backend. Tutaj dodajemy role userowe.</div>
			</div>
		);
	};

	const sectionContent = activeSection === "general" ? renderGeneralSection() : renderRolesSection();

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel}`}>
			<header className="mb-4">
				<h2 className="text-lg font-semibold">Utwórz serwer</h2>
				<p className={`text-xs mt-1 ${ui.muted}`}>REST: CreateGuild + CreateRole</p>
			</header>

			<div className="flex-1 flex gap-6 overflow-hidden">
				<nav className={`w-48 shrink-0 border-r pr-4 ${ui.border}`}>
					<ul className="space-y-1 text-sm">
						<li>
							<button type="button" onClick={() => setActiveSection("general")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "general" ? ui.navActive : ui.navIdle}`}>
								Ogólne
							</button>
						</li>
						<li>
							<button type="button" onClick={() => setActiveSection("roles")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "roles" ? ui.navActive : ui.navIdle}`}>
								Role
							</button>
						</li>
					</ul>
				</nav>

				<form className="flex-1 flex flex-col gap-6 overflow-auto" onSubmit={handleCreate}>
					{sectionContent}

					<div className={`border-t pt-4 mt-auto flex justify-end gap-3 ${ui.border}`}>
						<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={onCancel}>
							Anuluj
						</button>
						<button type="submit" className={`px-4 py-2 text-sm rounded-lg transition ${ui.buttonPrimary}`}>
							Utwórz
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}
