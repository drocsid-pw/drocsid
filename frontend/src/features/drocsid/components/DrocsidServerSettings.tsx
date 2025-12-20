import React, { useEffect, useMemo, useState } from "react";
import type { DrocsidChannel, DrocsidGuild, DrocsidGuildUser, DrocsidRole } from "../types";
import { useDrocsidTheme } from "../theme-provider";
import { PERMISSION_FLAGS, type PermissionFlag, permissionsStringToRecord, recordToPermissionsString, type PermissionsRecord } from "../permissions";
import { rolesToRoleForms, roleFormToDrocsidRole, type RoleForm } from "../roles";

type DrocsidServerSettingsProps = {
	server: DrocsidGuild | null;
	callerId: string;
	initialChannelId?: string | null;
	onSaved: (nextServer: DrocsidGuild) => void;
};

type OverrideRow = {
	guildRoleId: string;
	roleName: string;
	system?: boolean;
	permissions: PermissionsRecord;
};

function cloneChannel(channel: DrocsidChannel): DrocsidChannel {
	return {
		...channel,
		overrides: { roles: [...(channel.overrides?.roles ?? [])] },
		messages: [...(channel.messages ?? [])],
	};
}

function cloneUser(user: DrocsidGuildUser): DrocsidGuildUser {
	return {
		...user,
		roles: { roles: [...(user.roles?.roles ?? [])] },
	};
}

function ensureFullOverridesForChannel(channel: DrocsidChannel, roles: DrocsidRole[]): DrocsidChannel {
	const existing = new Map<string, DrocsidRole>();
	for (const r of channel.overrides?.roles ?? []) {
		existing.set(r.guildRoleId, r);
	}

	const nextRoles = roles.map((base) => {
		const prev = existing.get(base.guildRoleId);
		return {
			guildRoleId: base.guildRoleId,
			roleName: base.roleName,
			system: base.system,
			permissions: prev?.permissions ?? base.permissions,
		};
	});

	return { ...channel, overrides: { roles: nextRoles } };
}

function buildOverrideRows(serverRoles: DrocsidRole[], channelOverrides: DrocsidRole[] | undefined): OverrideRow[] {
	const overridesMap = new Map<string, DrocsidRole>();
	for (const r of channelOverrides ?? []) {
		overridesMap.set(r.guildRoleId, r);
	}

	return serverRoles.map((role) => {
		const override = overridesMap.get(role.guildRoleId) ?? role;

		return {
			guildRoleId: role.guildRoleId,
			roleName: role.roleName,
			system: role.system,
			permissions: permissionsStringToRecord(override.permissions),
		};
	});
}

function findRoleIdByName(roles: DrocsidRole[], roleName: string): string | null {
	const found = roles.find((r) => r.roleName === roleName);
	return found?.guildRoleId ?? null;
}

function getUserRoleIds(user: DrocsidGuildUser): string[] {
	const list0 = user.roles?.roles ?? [];
	return Array.from(new Set(list0.map((r) => r.guildRoleId)));
}

function setUserRoleIds(user: DrocsidGuildUser, rolesSnapshot: DrocsidRole[], roleIds: string[]): DrocsidGuildUser {
	const unique = Array.from(new Set(roleIds));
	const resolvedRoles: DrocsidRole[] = unique.map((id) => rolesSnapshot.find((r) => r.guildRoleId === id)).filter((x): x is DrocsidRole => !!x);

	return {
		...user,
		roles: { roles: resolvedRoles },
	};
}

export function DrocsidServerSettings(props: DrocsidServerSettingsProps) {
	const { server, onSaved, initialChannelId } = props;

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

	const [activeSection, setActiveSection] = useState<"general" | "roles" | "channels" | "users">("general");

	const [guildName, setGuildName] = useState(server?.name ?? "");
	const [guildIcon, setGuildIcon] = useState(server?.icon ?? "");

	const [roles, setRoles] = useState<RoleForm[]>(() => rolesToRoleForms(server?.roles));

	const roleSnapshot = useMemo<DrocsidRole[]>(() => roles.map((f) => roleFormToDrocsidRole(f)), [roles]);

	const [channelsDraft, setChannelsDraft] = useState<DrocsidChannel[]>(() => {
		const baseRoles = server?.roles ?? [];
		return (server?.channels ?? []).map((c) => ensureFullOverridesForChannel(cloneChannel(c), baseRoles));
	});

	const [selectedChannelId, setSelectedChannelId] = useState<string>(() => initialChannelId ?? server?.channels[0]?.channelId ?? "");

	const selectedChannel = useMemo(() => {
		if (!selectedChannelId) {
			return channelsDraft[0] ?? null;
		}
		return channelsDraft.find((c) => c.channelId === selectedChannelId) ?? channelsDraft[0] ?? null;
	}, [channelsDraft, selectedChannelId]);

	const [usersDraft, setUsersDraft] = useState<DrocsidGuildUser[]>(() => (server?.users ?? []).map(cloneUser));

	useEffect(() => {
		if (!server) {
			return;
		}

		setGuildName(server.name ?? "");
		setGuildIcon(server.icon ?? "");
		setRoles(rolesToRoleForms(server.roles));

		const baseRoles = server.roles ?? [];
		setChannelsDraft((server.channels ?? []).map((c) => ensureFullOverridesForChannel(cloneChannel(c), baseRoles)));

		setUsersDraft((server.users ?? []).map(cloneUser));

		setActiveSection("general");

		const nextChannelId = initialChannelId ?? server.channels[0]?.channelId ?? "";
		setSelectedChannelId(nextChannelId);
	}, [server?.guildId, initialChannelId]);

	useEffect(() => {
		if (roleSnapshot.length === 0) {
			return;
		}
		setChannelsDraft((current) => current.map((c) => ensureFullOverridesForChannel(c, roleSnapshot)));
		setUsersDraft((current) =>
			current.map((u) => {
				const ids = getUserRoleIds(u);
				return setUserRoleIds(u, roleSnapshot, ids);
			})
		);
	}, [roleSnapshot]);

	if (!server) {
		return (
			<section className={`h-full rounded-2xl border p-4 shadow-sm ${ui.panel}`}>
				<h2 className="text-lg font-semibold">Ustawienia serwera</h2>
				<p className={`text-sm mt-2 ${ui.muted}`}>Brak wybranego serwera.</p>
			</section>
		);
	}

	const ownerRoleId = findRoleIdByName(roleSnapshot, "@owner");
	const everyoneRoleId = findRoleIdByName(roleSnapshot, "@everyone");

	const ensureEveryone = (roleIds: string[]) => {
		if (!everyoneRoleId) {
			return roleIds;
		}
		if (roleIds.includes(everyoneRoleId)) {
			return roleIds;
		}
		return [...roleIds, everyoneRoleId];
	};

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

	const updateSelectedChannel = (updater: (channel: DrocsidChannel) => DrocsidChannel) => {
		if (!selectedChannel) {
			return;
		}
		setChannelsDraft((current) => current.map((c) => (c.channelId === selectedChannel.channelId ? updater(c) : c)));
	};

	const handleToggleOverridePermission = (guildRoleId: string, flag: PermissionFlag) => {
		updateSelectedChannel((ch) => {
			const rows = buildOverrideRows(roleSnapshot, ch.overrides?.roles);

			const nextRows = rows.map((r) => {
				if (r.guildRoleId !== guildRoleId) {
					return r;
				}
				return { ...r, permissions: { ...r.permissions, [flag]: !r.permissions[flag] } };
			});

			const nextOverrides: DrocsidRole[] = nextRows.map((r) => ({
				guildRoleId: r.guildRoleId,
				roleName: r.roleName,
				system: r.system,
				permissions: recordToPermissionsString(r.permissions),
			}));

			return { ...ch, overrides: { roles: nextOverrides } };
		});
	};

	const toggleUserRole = (guildUserId: string, guildRoleId: string) => {
		if (ownerRoleId && guildRoleId === ownerRoleId) {
			return;
		}
		if (everyoneRoleId && guildRoleId === everyoneRoleId) {
			return;
		}

		setUsersDraft((current) =>
			current.map((u) => {
				if (u.guildUserId !== guildUserId) {
					return u;
				}

				const prevIds = getUserRoleIds(u);
				const has = prevIds.includes(guildRoleId);
				const nextIds = ensureEveryone(has ? prevIds.filter((x) => x !== guildRoleId) : [...prevIds, guildRoleId]);

				return setUserRoleIds(u, roleSnapshot, nextIds);
			})
		);
	};

	const updateUserNick = (guildUserId: string, nick: string) => {
		setUsersDraft((current) => current.map((u) => (u.guildUserId === guildUserId ? { ...u, nick } : u)));
	};

	const handleAddMockUser = () => {
		const nextId = `tmp-user-${Date.now()}`;

		const base: DrocsidGuildUser = {
			guildUserId: nextId,
			nick: "Nowy user",
			roles: { roles: [] },
		};

		const withEveryone = setUserRoleIds(base, roleSnapshot, ensureEveryone([]));
		setUsersDraft((current) => [...current, withEveryone]);
	};

	const handleSaveAll = (event: React.FormEvent) => {
		event.preventDefault();

		const nextRoles: DrocsidRole[] = roles.map((f) => roleFormToDrocsidRole(f));

		const nextChannels: DrocsidChannel[] = channelsDraft.map((c) => ensureFullOverridesForChannel(c, nextRoles));

		const nextUsers: DrocsidGuildUser[] = usersDraft.map((u) => {
			const ids = ensureEveryone(getUserRoleIds(u));
			return setUserRoleIds(u, nextRoles, ids);
		});

		const nextServer: DrocsidGuild = {
			...server,
			name: guildName.trim(),
			icon: guildIcon.trim(),
			roles: nextRoles,
			channels: nextChannels,
			users: nextUsers,
		};

		onSaved(nextServer);

		setRoles(rolesToRoleForms(nextServer.roles));
		setChannelsDraft(nextServer.channels.map((c) => ensureFullOverridesForChannel(cloneChannel(c), nextServer.roles)));
		setUsersDraft(nextServer.users.map(cloneUser));
		setActiveSection("general");
	};

	const renderGeneralSection = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Ogólne</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>guild.Guild</p>
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

					<div className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Guild ID</span>
						<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>{server.guildId}</div>
						<span className={`text-xs ${ui.muted}`}>guildId</span>
					</div>

					<div className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Owner ID</span>
						<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>{server.ownerId || "-"}</div>
						<span className={`text-xs ${ui.muted}`}>ownerId</span>
					</div>
				</div>
			</div>
		);
	};

	const renderRolesSection = () => {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between gap-2">
					<div>
						<h3 className="text-sm font-semibold">Role</h3>
						<p className={`text-xs mt-1 ${ui.muted}`}>DrocsidRole</p>
					</div>
					<button type="button" onClick={handleAddRole} className={`px-3 py-1.5 text-xs rounded-lg transition ${ui.buttonPrimary}`}>
						Dodaj rolę
					</button>
				</div>

				<div className={`overflow-auto border rounded-xl ${ui.border}`}>
					<table className="min-w-full text-xs">
						<thead className={`${ui.tableHead} border-b ${ui.border}`}>
							<tr>
								<th className={`text-left px-3 py-2 font-medium w-56 ${ui.label}`}>roleName</th>
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
										<div className={`text-[10px] mt-1 ${ui.muted}`}>
											{role.guildRoleId} {role.isNew ? "new" : "existing"}
										</div>
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

				<div className={`text-[11px] ${ui.muted}`}>Mock: edytujesz role lokalnie w stanie frontu.</div>
			</div>
		);
	};

	const renderChannelsSection = () => {
		const channelId = selectedChannel?.channelId ?? "";
		const channelName = selectedChannel?.name ?? "";

		const overrideRows = buildOverrideRows(roleSnapshot, selectedChannel?.overrides?.roles);

		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Kanały</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>DrocsidChannel + overrides</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						<span className={`font-medium ${ui.label}`}>Wybierz kanał</span>
						<select value={channelId} onChange={(e) => setSelectedChannelId(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}>
							{channelsDraft.map((c) => (
								<option key={c.channelId} value={c.channelId}>
									#{c.name}
								</option>
							))}
						</select>
						<span className={`text-xs ${ui.muted}`}>Kanał do edycji</span>
					</label>
				</div>

				{selectedChannel && (
					<div className="space-y-4">
						<label className="flex flex-col gap-1 text-sm">
							<span className={`font-medium ${ui.label}`}>Nazwa kanału</span>
							<input
								value={channelName}
								onChange={(event) => updateSelectedChannel((ch) => ({ ...ch, name: event.target.value }))}
								className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
							/>
							<span className={`text-xs ${ui.muted}`}>name</span>
						</label>

						<div className={`overflow-auto border rounded-xl ${ui.border}`}>
							<table className="min-w-full text-xs">
								<thead className={`${ui.tableHead} border-b ${ui.border}`}>
									<tr>
										<th className={`text-left px-3 py-2 font-medium w-60 ${ui.label}`}>roleName</th>
										{PERMISSION_FLAGS.map((flag) => (
											<th key={flag} className={`text-left px-3 py-2 font-medium ${ui.label}`}>
												{flag}
											</th>
										))}
										<th className={`text-left px-3 py-2 font-medium ${ui.label}`}>permissions</th>
									</tr>
								</thead>

								<tbody>
									{overrideRows.map((row) => (
										<tr key={row.guildRoleId} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
											<td className="px-3 py-2 align-top">
												<div className="font-medium">{row.roleName}</div>
												<div className={`text-[10px] mt-1 ${ui.muted}`}>{row.guildRoleId}</div>
											</td>

											{PERMISSION_FLAGS.map((flag) => (
												<td key={flag} className="px-3 py-2 text-center align-middle">
													<label className="inline-flex items-center justify-center">
														<input type="checkbox" checked={row.permissions[flag]} onChange={() => handleToggleOverridePermission(row.guildRoleId, flag)} className="h-4 w-4" />
													</label>
												</td>
											))}

											<td className="px-3 py-2 align-middle">
												<div className={`px-2 py-1 rounded border text-[11px] ${ui.box}`}>{recordToPermissionsString(row.permissions) || "-"}</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className={`text-[11px] ${ui.muted}`}>Overrides są kompletne: każda rola ma swój wpis (domyślnie jak rola).</div>
					</div>
				)}
			</div>
		);
	};

	const renderUsersSection = () => {
		const visibleRoles = roleSnapshot;

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between gap-2">
					<div>
						<h3 className="text-sm font-semibold">Użytkownicy</h3>
						<p className={`text-xs mt-1 ${ui.muted}`}>DrocsidGuildUser.roles: {`{ roles: DrocsidRole[] }`}</p>
					</div>
					<button type="button" onClick={handleAddMockUser} className={`px-3 py-1.5 text-xs rounded-lg transition ${ui.buttonPrimary}`}>
						Dodaj usera (mock)
					</button>
				</div>

				<div className={`overflow-auto border rounded-xl ${ui.border}`}>
					<table className="min-w-full text-xs">
						<thead className={`${ui.tableHead} border-b ${ui.border}`}>
							<tr>
								<th className={`text-left px-3 py-2 font-medium w-60 ${ui.label}`}>nick</th>
								{visibleRoles.map((r) => (
									<th key={r.guildRoleId} className={`text-left px-3 py-2 font-medium ${ui.label}`}>
										{r.roleName}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{usersDraft.map((u) => {
								const ids = getUserRoleIds(u);

								return (
									<tr key={u.guildUserId} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
										<td className="px-3 py-2 align-top">
											<input
												value={u.nick}
												onChange={(e) => updateUserNick(u.guildUserId, e.target.value)}
												className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
											/>
											<div className={`text-[10px] mt-1 ${ui.muted}`}>{u.guildUserId}</div>
										</td>

										{visibleRoles.map((r) => {
											const isOwner = r.roleName === "@owner";
											const isEveryone = r.roleName === "@everyone";
											const checked = isEveryone ? true : ids.includes(r.guildRoleId);

											return (
												<td key={r.guildRoleId} className="px-3 py-2 text-center align-middle">
													<label className="inline-flex items-center justify-center">
														<input type="checkbox" checked={checked} disabled={isOwner || isEveryone} onChange={() => toggleUserRole(u.guildUserId, r.guildRoleId)} className="h-4 w-4" />
													</label>
												</td>
											);
										})}
									</tr>
								);
							})}

							{usersDraft.length === 0 && (
								<tr>
									<td colSpan={visibleRoles.length + 1} className={`px-3 py-6 text-sm ${ui.muted}`}>
										Brak użytkowników.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className={`text-[11px] ${ui.muted}`}>@everyone jest zawsze, @owner blokuję przed przypadkowym toggle.</div>
			</div>
		);
	};

	const sectionContent = activeSection === "general" ? renderGeneralSection() : activeSection === "roles" ? renderRolesSection() : activeSection === "channels" ? renderChannelsSection() : renderUsersSection();

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel}`}>
			<header className="mb-4">
				<h2 className="text-lg font-semibold">Ustawienia serwera</h2>
				<p className={`text-xs mt-1 ${ui.muted}`}>Mock edycji serwera (zgodne z types + mockData)</p>
			</header>

			<div className="flex-1 flex gap-6 overflow-hidden">
				<nav className={`w-52 shrink-0 border-r pr-4 ${ui.border}`}>
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
						<li>
							<button type="button" onClick={() => setActiveSection("channels")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "channels" ? ui.navActive : ui.navIdle}`}>
								Kanały
							</button>
						</li>
						<li>
							<button type="button" onClick={() => setActiveSection("users")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "users" ? ui.navActive : ui.navIdle}`}>
								Użytkownicy
							</button>
						</li>
					</ul>
				</nav>

				<form className="flex-1 flex flex-col gap-6 overflow-auto" onSubmit={handleSaveAll}>
					{sectionContent}

					<div className={`border-t pt-4 mt-auto flex justify-end gap-3 ${ui.border}`}>
						<button
							type="button"
							className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`}
							onClick={() => {
								setGuildName(server.name);
								setGuildIcon(server.icon);
								setRoles(rolesToRoleForms(server.roles));

								const baseRoles = server.roles ?? [];
								setChannelsDraft(server.channels.map((c) => ensureFullOverridesForChannel(cloneChannel(c), baseRoles)));

								setUsersDraft(server.users.map(cloneUser));
								setActiveSection("general");
								setSelectedChannelId(initialChannelId ?? server.channels[0]?.channelId ?? "");
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
