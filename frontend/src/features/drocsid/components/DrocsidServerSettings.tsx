import React, { useEffect, useMemo, useState } from "react";
import type { DrocsidChannel, DrocsidGuildUser, DrocsidRole, DrocsidServer } from "../types";
import { useDrocsidTheme } from "../theme-provider";
import { PERMISSION_FLAGS, type PermissionFlag, permissionsListToRecord, recordToPermissionsString } from "../permissions";
import { roleFormToDrocsidRole, roleFormToProtoRole, rolesToRoleForms, type ProtoRole, type RoleForm } from "../roles";

type ProtoGuild = {
	guild_id: string;
	name: string;
	icon: string;
	owner_id: string;
	roles: ProtoRole[];
};

type ProtoUpdateGuildRequest = {
	caller_id: string;
	guild: ProtoGuild;
};

type ProtoCreateRoleReq = {
	guild_id: string;
	role_name: string;
	permissions: string;
	caller_id: string;
};

type ProtoUpdateRoleReq = {
	guild_id: string;
	role: ProtoRole;
	caller_id: string;
};

type ProtoRoleList = {
	roles: ProtoRole[];
};

type ProtoChannel = {
	channel_id: string;
	name: string;
	guild_id: string;
	overrides: ProtoRoleList;
};

type ProtoUpdateChannelRequest = {
	caller_id: string;
	channel: ProtoChannel;
};

type ProtoGuildUser = {
	guild_user_id: string;
	nick: string;
	roles: ProtoRoleList[];
};

type ProtoUpdateGuildUserReq = {
	caller_id: string;
	guild_id: string;
	user: ProtoGuildUser;
};

type OverrideRow = {
	guild_role_id: string;
	role_name: string;
	permissions: ReturnType<typeof permissionsListToRecord>;
};

type DrocsidServerSettingsProps = {
	server: DrocsidServer | null;
	callerId: string;
	initialChannelId?: string | null;
	onSaved: (nextServer: DrocsidServer) => void;
};

function cloneChannel(channel: DrocsidChannel): DrocsidChannel {
	return {
		...channel,
		overrides: (channel.overrides ?? []).map((r) => ({ ...r })),
		messages: [...(channel.messages ?? [])],
	};
}

function cloneUser(user: DrocsidGuildUser): DrocsidGuildUser {
	return {
		...user,
		roleIds: [...user.roleIds],
	};
}

function ensureFullOverridesForChannel(channel: DrocsidChannel, roles: DrocsidRole[]): DrocsidChannel {
	const existing = new Map<string, DrocsidRole>();
	for (const r of channel.overrides ?? []) {
		existing.set(r.id, r);
	}

	const nextOverrides: DrocsidRole[] = roles.map((role) => {
		const prev = existing.get(role.id);
		return {
			id: role.id,
			name: role.name,
			system: role.system,
			permissions: prev?.permissions ?? role.permissions,
		};
	});

	return { ...channel, overrides: nextOverrides };
}

function buildOverrideRows(serverRoles: DrocsidRole[], channelOverrides: DrocsidRole[] | undefined): OverrideRow[] {
	const overridesMap = new Map<string, DrocsidRole>();
	for (const r of channelOverrides ?? []) {
		overridesMap.set(r.id, r);
	}

	return serverRoles.map((role) => {
		const override = overridesMap.get(role.id);
		return {
			guild_role_id: role.id,
			role_name: role.name,
			permissions: permissionsListToRecord((override ?? role).permissions),
		};
	});
}

function findEveryoneRoleId(roles: DrocsidRole[]): string | null {
	const found = roles.find((r) => r.name === "@everyone");
	return found?.id ?? null;
}

function togglePermissionOnList(perms: DrocsidRole["permissions"], flag: PermissionFlag): DrocsidRole["permissions"] {
	const record = permissionsListToRecord(perms);
	record[flag] = !record[flag];
	const next = PERMISSION_FLAGS.filter((p) => record[p]);
	return next;
}

export function DrocsidServerSettings(props: DrocsidServerSettingsProps) {
	const { server, callerId, initialChannelId, onSaved } = props;

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

	const [channelsDraft, setChannelsDraft] = useState<DrocsidChannel[]>(() => {
		const serverRoles = server?.roles ?? [];
		return (server?.channels ?? []).map((c) => ensureFullOverridesForChannel(cloneChannel(c), serverRoles));
	});

	const [selectedChannelId, setSelectedChannelId] = useState<string>(() => initialChannelId ?? server?.channels[0]?.id ?? "");
	const [channelSection, setChannelSection] = useState<"general" | "overrides">("general");

	const roleSnapshot = useMemo<DrocsidRole[]>(() => {
		return roles.map((f) => roleFormToDrocsidRole(f));
	}, [roles]);

	const everyoneRoleId = useMemo(() => findEveryoneRoleId(roleSnapshot), [roleSnapshot]);

	const selectedChannel = useMemo(() => {
		if (!selectedChannelId) {
			return channelsDraft[0] ?? null;
		}
		return channelsDraft.find((c) => c.id === selectedChannelId) ?? channelsDraft[0] ?? null;
	}, [channelsDraft, selectedChannelId]);

	const usersDraftInit = useMemo(() => (server?.users ?? []).map(cloneUser), [server?.users]);
	const [usersDraft, setUsersDraft] = useState<DrocsidGuildUser[]>(() => usersDraftInit);

	useEffect(() => {
		if (!server) {
			return;
		}

		setGuildName(server.name ?? "");
		setGuildIcon(server.icon ?? "");
		setRoles(rolesToRoleForms(server.roles));

		const serverRoles = server.roles ?? [];
		setChannelsDraft((server.channels ?? []).map((c) => ensureFullOverridesForChannel(cloneChannel(c), serverRoles)));

		setUsersDraft((server.users ?? []).map(cloneUser));
		setActiveSection("general");
		setChannelSection("general");

		const nextChannelId = initialChannelId ?? server.channels[0]?.id ?? "";
		setSelectedChannelId(nextChannelId);
	}, [server?.id, initialChannelId]);

	useEffect(() => {
		if (roleSnapshot.length === 0) {
			return;
		}
		setChannelsDraft((current) => current.map((c) => ensureFullOverridesForChannel(c, roleSnapshot)));
	}, [roleSnapshot]);

	if (!server) {
		return (
			<section className={`h-full rounded-2xl border p-4 shadow-sm ${ui.panel}`}>
				<h2 className="text-lg font-semibold">Ustawienia serwera</h2>
				<p className={`text-sm mt-2 ${ui.muted}`}>Brak wybranego serwera.</p>
			</section>
		);
	}

	const guildId = server.id;
	const ownerId = (server as unknown as { ownerId?: string; owner_id?: string } | null)?.ownerId ?? (server as unknown as { ownerId?: string; owner_id?: string } | null)?.owner_id ?? "";

	const updateSelectedChannel = (updater: (channel: DrocsidChannel) => DrocsidChannel) => {
		if (!selectedChannel) {
			return;
		}
		setChannelsDraft((current) => current.map((c) => (c.id === selectedChannel.id ? updater(c) : c)));
	};

	const handleAddRole = () => {
		const baseName = "Nowa rola";
		let index = 1;

		const existing = new Set(roles.map((r) => r.role_name.toLowerCase()));
		let candidate = baseName;
		while (existing.has(candidate.toLowerCase())) {
			index += 1;
			candidate = `${baseName} ${index}`;
		}

		setRoles((current) => [
			...current,
			{
				guild_role_id: `tmp-${Date.now()}`,
				role_name: candidate,
				permissions: permissionsListToRecord(["READ", "WRITE"]),
				isNew: true,
			},
		]);
	};

	const handleRenameRole = (roleId: string, newName: string) => {
		setRoles((current) => current.map((r) => (r.guild_role_id === roleId ? { ...r, role_name: newName } : r)));
	};

	const handleToggleRolePermission = (roleId: string, flag: PermissionFlag) => {
		setRoles((current) =>
			current.map((r) => {
				if (r.guild_role_id !== roleId) {
					return r;
				}
				return { ...r, permissions: { ...r.permissions, [flag]: !r.permissions[flag] } };
			})
		);
	};

	const handleToggleOverridePermission = (roleId: string, flag: PermissionFlag) => {
		updateSelectedChannel((ch) => {
			const nextOverrides = (ch.overrides ?? []).map((r) => (r.id === roleId ? { ...r, permissions: togglePermissionOnList(r.permissions, flag) } : r));
			return { ...ch, overrides: nextOverrides };
		});
	};

	const overrideRows = useMemo(() => buildOverrideRows(roleSnapshot, selectedChannel?.overrides), [roleSnapshot, selectedChannel?.overrides]);

	const ensureEveryoneOnUser = (roleIds: string[]) => {
		if (!everyoneRoleId) {
			return roleIds;
		}
		if (roleIds.includes(everyoneRoleId)) {
			return roleIds;
		}
		return [...roleIds, everyoneRoleId];
	};

	const toggleUserRole = (userId: string, roleId: string) => {
		setUsersDraft((current) =>
			current.map((u) => {
				if (u.id !== userId) {
					return u;
				}

				if (roleSnapshot.find((r) => r.id === roleId)?.name === "@owner") {
					return u;
				}

				if (roleSnapshot.find((r) => r.id === roleId)?.name === "@everyone") {
					return u;
				}

				const has = u.roleIds.includes(roleId);
				const nextRoleIds = has ? u.roleIds.filter((x) => x !== roleId) : [...u.roleIds, roleId];
				return { ...u, roleIds: ensureEveryoneOnUser(nextRoleIds) };
			})
		);
	};

	const updateUserNick = (userId: string, nick: string) => {
		setUsersDraft((current) => current.map((u) => (u.id === userId ? { ...u, nick } : u)));
	};

	const handleAddMockUser = () => {
		const nextId = `tmp-user-${Date.now()}`;
		setUsersDraft((current) => [...current, { id: nextId, nick: "Nowy user", roleIds: ensureEveryoneOnUser([]) }]);
	};

	const buildProtoRoleFromSnapshot = (roleId: string): ProtoRole | null => {
		const found = roleSnapshot.find((r) => r.id === roleId);
		if (!found) {
			return null;
		}
		return {
			guild_role_id: found.id,
			role_name: found.name,
			permissions: found.permissions.join("|"),
		};
	};

	const handleSaveAll = (event: React.FormEvent) => {
		event.preventDefault();

		const newRoleIdMap = new Map<string, string>();
		const now = Date.now();

		const nextRoleSnapshot: DrocsidRole[] = roles.map((form, idx) => {
			if (!form.isNew) {
				return roleFormToDrocsidRole(form);
			}
			const nextId = `${guildId}-role-${now}-${idx + 1}`;
			newRoleIdMap.set(form.guild_role_id, nextId);
			return {
				...roleFormToDrocsidRole(form),
				id: nextId,
			};
		});

		const remapRoleId = (roleId: string) => newRoleIdMap.get(roleId) ?? roleId;

		const nextChannels: DrocsidChannel[] = channelsDraft.map((c) => ({
			...c,
			overrides: (c.overrides ?? []).map((r) => ({ ...r, id: remapRoleId(r.id) })),
		}));

		const nextUsers: DrocsidGuildUser[] = usersDraft.map((u) => ({
			...u,
			roleIds: Array.from(new Set(u.roleIds.map(remapRoleId))),
		}));

		const protoRoles: ProtoRole[] = roles.filter((r) => !r.isNew).map((r) => roleFormToProtoRole(r));

		const updateGuildReq: ProtoUpdateGuildRequest = {
			caller_id: callerId,
			guild: {
				guild_id: guildId,
				name: guildName.trim(),
				icon: guildIcon.trim(),
				owner_id: ownerId,
				roles: protoRoles,
			},
		};

		const createRoleReqs: ProtoCreateRoleReq[] = roles
			.filter((r) => r.isNew)
			.map((r) => ({
				guild_id: guildId,
				role_name: r.role_name.trim(),
				permissions: recordToPermissionsString(r.permissions),
				caller_id: callerId,
			}));

		const updateRoleReqs: ProtoUpdateRoleReq[] = roles
			.filter((r) => !r.isNew)
			.map((r) => ({
				guild_id: guildId,
				role: roleFormToProtoRole(r),
				caller_id: callerId,
			}));

		const updateChannelReqs: ProtoUpdateChannelRequest[] = nextChannels.map((ch) => {
			const overridesRoles: ProtoRole[] = (ch.overrides ?? []).map((r) => ({
				guild_role_id: r.id,
				role_name: r.name,
				permissions: r.permissions.join("|"),
			}));

			return {
				caller_id: callerId,
				channel: {
					channel_id: ch.id,
					name: ch.name.trim(),
					guild_id: guildId,
					overrides: { roles: overridesRoles },
				},
			};
		});

		const updateUsersReqs: ProtoUpdateGuildUserReq[] = nextUsers.map((u) => {
			const roleList: ProtoRole[] = u.roleIds
				.map((rid) => {
					const proto = buildProtoRoleFromSnapshot(rid);
					if (proto) {
						return proto;
					}
					const remapped = newRoleIdMap.get(rid);
					if (!remapped) {
						return null;
					}
					const fromNext = nextRoleSnapshot.find((r) => r.id === remapped);
					if (!fromNext) {
						return null;
					}
					return { guild_role_id: fromNext.id, role_name: fromNext.name, permissions: fromNext.permissions.join("|") };
				})
				.filter((x): x is ProtoRole => !!x);

			return {
				caller_id: callerId,
				guild_id: guildId,
				user: {
					guild_user_id: u.id,
					nick: u.nick.trim(),
					roles: [{ roles: roleList }],
				},
			};
		});

		alert(
			[
				"GuildService.UpdateGuild(UpdateGuildRequest)",
				JSON.stringify(updateGuildReq, null, 2),
				"",
				"GuildService.CreateRole(CreateRoleReq) x N",
				JSON.stringify(createRoleReqs, null, 2),
				"",
				"GuildService.UpdateRole(UpdateRoleReq) x N",
				JSON.stringify(updateRoleReqs, null, 2),
				"",
				"ChannelService.UpdateChannel(UpdateChannelRequest) x N",
				JSON.stringify(updateChannelReqs, null, 2),
				"",
				"GuildService.UpdateUser(guild_user.UpdateUserReq) x N",
				JSON.stringify(updateUsersReqs, null, 2),
				"",
				"Symulacja: nowe ID ról (tmp -> real)",
				JSON.stringify(Object.fromEntries(newRoleIdMap.entries()), null, 2),
			].join("\n")
		);

		const nextServer: DrocsidServer = {
			...server,
			name: guildName.trim(),
			icon: guildIcon.trim(),
			roles: nextRoleSnapshot,
			channels: nextChannels,
			users: nextUsers,
		};

		onSaved(nextServer);

		setRoles(rolesToRoleForms(nextServer.roles));
		setChannelsDraft(nextServer.channels.map((c) => ensureFullOverridesForChannel(cloneChannel(c), nextServer.roles ?? [])));
		setUsersDraft((nextServer.users ?? []).map(cloneUser));
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
						<span className={`text-xs ${ui.muted}`}>guild.name</span>
					</label>

					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Ikona</span>
						<input value={guildIcon} onChange={(event) => setGuildIcon(event.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`} />
						<span className={`text-xs ${ui.muted}`}>guild.icon</span>
					</label>

					<div className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Guild ID</span>
						<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>{guildId}</div>
						<span className={`text-xs ${ui.muted}`}>guild.guild_id</span>
					</div>

					<div className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Owner ID</span>
						<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>{ownerId || "-"}</div>
						<span className={`text-xs ${ui.muted}`}>guild.owner_id</span>
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
						<p className={`text-xs mt-1 ${ui.muted}`}>role.Role</p>
					</div>
					<button type="button" onClick={handleAddRole} className={`px-3 py-1.5 text-xs rounded-lg transition ${ui.buttonPrimary}`}>
						Dodaj rolę
					</button>
				</div>

				<div className={`overflow-auto border rounded-xl ${ui.border}`}>
					<table className="min-w-full text-xs">
						<thead className={`${ui.tableHead} border-b ${ui.border}`}>
							<tr>
								<th className={`text-left px-3 py-2 font-medium w-56 ${ui.label}`}>role_name</th>
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
								<tr key={role.guild_role_id} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
									<td className="px-3 py-2 align-top">
										<input
											value={role.role_name}
											onChange={(event) => handleRenameRole(role.guild_role_id, event.target.value)}
											className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
										/>
										<div className={`text-[10px] mt-1 ${ui.muted}`}>
											{role.guild_role_id} {role.isNew ? "CreateRoleReq" : "UpdateRoleReq"}
										</div>
									</td>

									{PERMISSION_FLAGS.map((flag) => (
										<td key={flag} className="px-3 py-2 text-center align-middle">
											<label className="inline-flex items-center justify-center">
												<input type="checkbox" checked={role.permissions[flag]} onChange={() => handleToggleRolePermission(role.guild_role_id, flag)} className="h-4 w-4" />
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

				<div className={`text-[11px] ${ui.muted}`}>Brak DeleteRole w proto. Nowe role dostają docelowe ID dopiero po zapisie (symulowane).</div>
			</div>
		);
	};

	const renderChannelsSection = () => {
		const channelId = selectedChannel?.id ?? "";
		const channelName = selectedChannel?.name ?? "";

		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Kanały</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>channel.Channel + overrides</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						<span className={`font-medium ${ui.label}`}>Wybierz kanał</span>
						<select
							value={channelId}
							onChange={(e) => {
								setSelectedChannelId(e.target.value);
								setChannelSection("general");
							}}
							className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}>
							{channelsDraft.map((c) => (
								<option key={c.id} value={c.id}>
									#{c.name}
								</option>
							))}
						</select>
						<span className={`text-xs ${ui.muted}`}>Kanał do edycji</span>
					</label>
				</div>

				<div className="flex gap-6 overflow-hidden">
					<nav className={`w-48 shrink-0 border-r pr-4 ${ui.border}`}>
						<ul className="space-y-1 text-sm">
							<li>
								<button type="button" onClick={() => setChannelSection("general")} className={`w-full text-left px-3 py-2 rounded-lg transition ${channelSection === "general" ? ui.navActive : ui.navIdle}`}>
									Ogólne
								</button>
							</li>
							<li>
								<button type="button" onClick={() => setChannelSection("overrides")} className={`w-full text-left px-3 py-2 rounded-lg transition ${channelSection === "overrides" ? ui.navActive : ui.navIdle}`}>
									Overrides
								</button>
							</li>
						</ul>
					</nav>

					<div className="flex-1 overflow-auto">
						{channelSection === "general" && (
							<div className="space-y-4">
								<label className="flex flex-col gap-1 text-sm">
									<span className={`font-medium ${ui.label}`}>Nazwa kanału</span>
									<input
										value={channelName}
										onChange={(event) => updateSelectedChannel((ch) => ({ ...ch, name: event.target.value }))}
										className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
									/>
									<span className={`text-xs ${ui.muted}`}>channel.name</span>
								</label>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="flex flex-col gap-1 text-sm">
										<span className={`font-medium ${ui.label}`}>Channel ID</span>
										<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>{channelId}</div>
										<span className={`text-xs ${ui.muted}`}>channel.channel_id</span>
									</div>

									<div className="flex flex-col gap-1 text-sm">
										<span className={`font-medium ${ui.label}`}>Guild ID</span>
										<div className={`px-3 py-2 rounded-lg border text-xs ${ui.box}`}>{guildId}</div>
										<span className={`text-xs ${ui.muted}`}>channel.guild_id</span>
									</div>
								</div>
							</div>
						)}

						{channelSection === "overrides" && (
							<div className="space-y-4">
								<div className={`overflow-auto border rounded-xl ${ui.border}`}>
									<table className="min-w-full text-xs">
										<thead className={`${ui.tableHead} border-b ${ui.border}`}>
											<tr>
												<th className={`text-left px-3 py-2 font-medium w-60 ${ui.label}`}>role</th>
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
												<tr key={row.guild_role_id} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
													<td className="px-3 py-2 align-top">
														<div className="font-medium">{row.role_name}</div>
														<div className={`text-[10px] mt-1 ${ui.muted}`}>{row.guild_role_id}</div>
													</td>

													{PERMISSION_FLAGS.map((flag) => (
														<td key={flag} className="px-3 py-2 text-center align-middle">
															<label className="inline-flex items-center justify-center">
																<input type="checkbox" checked={row.permissions[flag]} onChange={() => handleToggleOverridePermission(row.guild_role_id, flag)} className="h-4 w-4" />
															</label>
														</td>
													))}

													<td className="px-3 py-2 align-middle">
														<div className={`px-2 py-1 rounded border text-[11px] ${ui.box}`}>{recordToPermissionsString(row.permissions) || "-"}</div>
													</td>
												</tr>
											))}

											{overrideRows.length === 0 && (
												<tr>
													<td colSpan={PERMISSION_FLAGS.length + 2} className={`px-3 py-6 text-sm ${ui.muted}`}>
														Brak ról na serwerze.
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>

								<div className={`text-[11px] ${ui.muted}`}>Overrides są zawsze kompletne: każda rola ma swój wpis (domyślnie jak rola).</div>
							</div>
						)}
					</div>
				</div>
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
						<p className={`text-xs mt-1 ${ui.muted}`}>guild_user.GuildUser + przypisywanie ról</p>
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
									<th key={r.id} className={`text-left px-3 py-2 font-medium ${ui.label}`}>
										{r.name}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{usersDraft.map((u) => (
								<tr key={u.id} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
									<td className="px-3 py-2 align-top">
										<input value={u.nick} onChange={(e) => updateUserNick(u.id, e.target.value)} className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`} />
										<div className={`text-[10px] mt-1 ${ui.muted}`}>{u.id}</div>
									</td>

									{visibleRoles.map((r) => {
										const isOwner = r.name === "@owner";
										const isEveryone = r.name === "@everyone";
										const checked = isEveryone ? true : u.roleIds.includes(r.id);

										return (
											<td key={r.id} className="px-3 py-2 text-center align-middle">
												<label className="inline-flex items-center justify-center">
													<input type="checkbox" checked={checked} disabled={isOwner || isEveryone} onChange={() => toggleUserRole(u.id, r.id)} className="h-4 w-4" />
												</label>
											</td>
										);
									})}
								</tr>
							))}

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

				<div className={`text-[11px] ${ui.muted}`}>@everyone jest “zawsze”, a @owner blokuję przed przypadkowym toggle.</div>
			</div>
		);
	};

	const sectionContent = activeSection === "general" ? renderGeneralSection() : activeSection === "roles" ? renderRolesSection() : activeSection === "channels" ? renderChannelsSection() : renderUsersSection();

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel}`}>
			<header className="mb-4">
				<h2 className="text-lg font-semibold">Ustawienia serwera</h2>
				<p className={`text-xs mt-1 ${ui.muted}`}>UpdateGuild + Role management + Channel overrides + User role assignment</p>
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

								const serverRoles = server.roles ?? [];
								setChannelsDraft(server.channels.map((c) => ensureFullOverridesForChannel(cloneChannel(c), serverRoles)));

								setUsersDraft((server.users ?? []).map(cloneUser));
								setActiveSection("general");
								setChannelSection("general");
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
