import React, { useEffect, useMemo, useState } from "react";
import type { DrocsidChannel, DrocsidGuild, DrocsidGuildUser, DrocsidRole } from "../types";
import { useDrocsidTheme } from "../theme-provider";
import { PERMISSION_FLAGS, type PermissionFlag, recordToPermissionsString, type PermissionsRecord, permissionsListToRecord, recordToPermissionsList } from "../permissions";
import { rolesToRoleForms, type RoleForm } from "../roles";
import { useDrocsidApi } from "../../../api/useDrocsidApi";
import { isDrocsidApiError } from "../../../api/http";
import { mapChannelDto, mapGuildDto, mapGuildUserDto, mapRoleDto } from "../mappers";
import { DrocsidInvitePanel } from "./DrocsidInvitePanel";

type DrocsidServerSettingsProps = {
	server: DrocsidGuild | null;
	callerId: string;
	initialChannelId?: string | null;
	onSaved: (nextServer: DrocsidGuild) => void;
	onDeleted?: (guildId: string) => void;
};

type ActiveSection = "general" | "roles" | "channels" | "members";

type OverrideRow = {
	guildRoleId: string;
	roleName: string;
	system?: boolean;
	permissions: PermissionsRecord;
};

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
		roleIds: [...(user.roleIds ?? [])],
	};
}

function findRoleIdByName(roles: DrocsidRole[], roleName: string): string | null {
	const found = roles.find((r) => r.roleName === roleName);
	return found?.guildRoleId ?? null;
}

function getUserRoleIds(user: DrocsidGuildUser): string[] {
	if (Array.isArray(user.roleIds) && user.roleIds.length) {
		return Array.from(new Set(user.roleIds));
	}
	const list0 = user.roles?.roles ?? [];
	return Array.from(new Set(list0.map((r) => r.guildRoleId)));
}

function setUserRoleIds(user: DrocsidGuildUser, rolesSnapshot: DrocsidRole[], roleIds: string[]): DrocsidGuildUser {
	const unique = Array.from(new Set(roleIds));
	const resolvedRoles: DrocsidRole[] = unique.map((id) => rolesSnapshot.find((r) => r.guildRoleId === id)).filter((x): x is DrocsidRole => !!x);

	return {
		...user,
		roleIds: unique,
		roles: { roles: resolvedRoles },
	};
}

function ensureFullOverridesForChannel(channel: DrocsidChannel, roles: DrocsidRole[]): DrocsidChannel {
	const existing = new Map<string, DrocsidRole>();
	for (const r of channel.overrides?.roles ?? []) {
		existing.set(r.guildRoleId, r);
	}

	const nextRoles = roles.map((base) => {
		const prev = existing.get(base.guildRoleId);

		const prevRecord = prev ? permissionsListToRecord(prev.permissionsRaw ?? "") : permissionsListToRecord(base.permissionsRaw ?? "");

		const raw = recordToPermissionsString(prevRecord);

		return {
			guildRoleId: base.guildRoleId,
			roleName: base.roleName,
			system: base.system,
			permissions: recordToPermissionsList(prevRecord),
			permissionsRaw: raw,
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
		const raw = override.permissionsRaw ?? "";
		return {
			guildRoleId: role.guildRoleId,
			roleName: role.roleName,
			system: role.system,
			permissions: permissionsListToRecord(raw),
		};
	});
}

function validateUniqueRoleNames(forms: RoleForm[]): string | null {
	const names = forms.map((r) => r.roleName.trim()).filter((x) => x.length > 0);
	const seen = new Set<string>();
	for (const name of names) {
		const key = name.toLowerCase();
		if (seen.has(key)) {
			return `Role names must be unique. Duplicate: "${name}".`;
		}
		seen.add(key);
	}
	return null;
}

function makeTempId(prefix: string): string {
	const cryptoAny = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
	const uuid = cryptoAny.crypto?.randomUUID?.();
	if (uuid) {
		return `${prefix}${uuid}`;
	}
	return `${prefix}${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTempChannelId(channelId: string): boolean {
	return channelId.startsWith("tmp-");
}

function createDraftChannel(guildId: string, roleSnapshot: DrocsidRole[], name: string): DrocsidChannel {
	const channelId = makeTempId("tmp-");

	const overridesRoles: DrocsidRole[] = roleSnapshot.map((r) => {
		const raw = r.permissionsRaw ?? "";
		const rec = permissionsListToRecord(raw);
		return {
			guildRoleId: r.guildRoleId,
			roleName: r.roleName,
			system: r.system,
			permissions: recordToPermissionsList(rec),
			permissionsRaw: recordToPermissionsString(rec),
		};
	});

	return {
		channelId,
		name,
		guildId,
		overrides: { roles: overridesRoles },
		messages: [],
	};
}

function buildChannelPayload(ch: DrocsidChannel, guildId: string) {
	return {
		name: (ch.name ?? "").trim(),
		guildId,
		overrides: {
			roles: (ch.overrides?.roles ?? []).map((r) => ({
				guildRoleId: r.guildRoleId,
				roleName: r.roleName,
				permissions: r.permissionsRaw ?? "",
			})),
		},
	};
}

export function DrocsidServerSettings(props: DrocsidServerSettingsProps) {
	const { server, onSaved, initialChannelId, onDeleted } = props;

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
			buttonDanger: isDark ? "bg-red-500/20 text-red-200 hover:bg-red-500/30 border-red-500/30" : "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
			border: isDark ? "border-[#212124]" : "border-slate-200",
			tableHead: isDark ? "bg-white/5" : "bg-slate-50",
			tableRowHover: isDark ? "hover:bg-white/5" : "hover:bg-slate-50",
			box: isDark ? "bg-white/5 border-[#212124] text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700",
		};
	}, [isDark]);

	const [activeSection, setActiveSection] = useState<ActiveSection>("general");

	const [guildName, setGuildName] = useState(server?.name ?? "");
	const [guildIcon, setGuildIcon] = useState(server?.icon ?? "");

	const [roles, setRoles] = useState<RoleForm[]>(() => rolesToRoleForms(server?.roles));

	const roleSnapshot = useMemo<DrocsidRole[]>(() => {
		return roles.map((f) => {
			const raw = recordToPermissionsString(f.permissions);
			return {
				guildRoleId: f.guildRoleId,
				roleName: f.roleName.trim(),
				system: f.system,
				permissions: recordToPermissionsList(f.permissions),
				permissionsRaw: raw,
			};
		});
	}, [roles]);

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

	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const [memberFilter, setMemberFilter] = useState("");

	const [isAddingChannel, setIsAddingChannel] = useState(false);
	const [newChannelName, setNewChannelName] = useState("");
	const [channelAddError, setChannelAddError] = useState<string | null>(null);

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
		setMemberFilter("");

		setIsAddingChannel(false);
		setNewChannelName("");
		setChannelAddError(null);
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

	const ownerRoleId = useMemo(() => findRoleIdByName(roleSnapshot, "@owner"), [roleSnapshot]);
	const everyoneRoleId = useMemo(() => findRoleIdByName(roleSnapshot, "@everyone"), [roleSnapshot]);

	const ensureEveryone = (roleIds: string[]) => {
		if (!everyoneRoleId) {
			return roleIds;
		}
		if (roleIds.includes(everyoneRoleId)) {
			return roleIds;
		}
		return [...roleIds, everyoneRoleId];
	};

	const baselineKey = useMemo(() => {
		if (!server) {
			return "";
		}

		const rolesBase = rolesToRoleForms(server.roles).map((r) => ({
			id: r.guildRoleId,
			name: r.roleName,
			system: !!r.system,
			permissions: recordToPermissionsString(r.permissions),
		}));

		const channelsBase = (server.channels ?? []).map((c) => {
			const full = ensureFullOverridesForChannel(cloneChannel(c), server.roles ?? []);
			return {
				id: full.channelId,
				name: full.name,
				overrides: (full.overrides?.roles ?? []).map((r) => ({
					id: r.guildRoleId,
					raw: r.permissionsRaw ?? "",
				})),
			};
		});

		const usersBase = (server.users ?? []).map((u) => ({
			id: u.guildUserId,
			nick: u.nick,
			roleIds: ensureEveryone(getUserRoleIds(u)).sort(),
		}));

		return JSON.stringify({
			guildName: server.name ?? "",
			guildIcon: server.icon ?? "",
			rolesBase,
			channelsBase,
			usersBase,
		});
	}, [server, everyoneRoleId]);

	const draftKey = useMemo(() => {
		const rolesDraftKey = roles.map((r) => ({
			id: r.guildRoleId,
			name: r.roleName,
			system: !!r.system,
			permissions: recordToPermissionsString(r.permissions),
		}));

		const channelsDraftKey = channelsDraft.map((c) => {
			const full = ensureFullOverridesForChannel(c, roleSnapshot);
			return {
				id: full.channelId,
				name: full.name,
				overrides: (full.overrides?.roles ?? []).map((r) => ({
					id: r.guildRoleId,
					raw: r.permissionsRaw ?? "",
				})),
			};
		});

		const usersDraftKey = usersDraft.map((u) => ({
			id: u.guildUserId,
			nick: u.nick,
			roleIds: ensureEveryone(getUserRoleIds(u)).sort(),
		}));

		return JSON.stringify({
			guildName,
			guildIcon,
			rolesDraftKey,
			channelsDraftKey,
			usersDraftKey,
		});
	}, [roles, channelsDraft, usersDraft, guildName, guildIcon, roleSnapshot, everyoneRoleId]);

	const isDirty = baselineKey !== "" && baselineKey !== draftKey;

	if (!server) {
		return (
			<section className={`h-full rounded-2xl border p-4 shadow-sm ${ui.panel}`}>
				<h2 className="text-lg font-semibold">Server settings</h2>
				<p className={`text-sm mt-2 ${ui.muted}`}>No server selected.</p>
			</section>
		);
	}

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

			const nextOverrides: DrocsidRole[] = nextRows.map((r) => {
				const raw = recordToPermissionsString(r.permissions);
				return {
					guildRoleId: r.guildRoleId,
					roleName: r.roleName,
					system: r.system,
					permissions: recordToPermissionsList(r.permissions),
					permissionsRaw: raw,
				};
			});

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

	const resetAll = () => {
		setGuildName(server.name ?? "");
		setGuildIcon(server.icon ?? "");
		setRoles(rolesToRoleForms(server.roles));

		const baseRoles = server.roles ?? [];
		setChannelsDraft(server.channels.map((c) => ensureFullOverridesForChannel(cloneChannel(c), baseRoles)));

		setUsersDraft(server.users.map(cloneUser));
		setActiveSection("general");
		setSelectedChannelId(initialChannelId ?? server.channels[0]?.channelId ?? "");
		setMemberFilter("");
		setSaveError(null);

		setIsAddingChannel(false);
		setNewChannelName("");
		setChannelAddError(null);
	};

	const startAddChannel = () => {
		setChannelAddError(null);
		setIsAddingChannel(true);
		setNewChannelName("");
	};

	const cancelAddChannel = () => {
		setChannelAddError(null);
		setIsAddingChannel(false);
		setNewChannelName("");
	};

	const confirmAddChannel = () => {
		setChannelAddError(null);

		const name = newChannelName.trim();
		if (!name) {
			setChannelAddError("Channel name is required.");
			return;
		}

		const key = normalizeName(name);
		const taken = channelsDraft.some((c) => normalizeName(c.name) === key);
		if (taken) {
			setChannelAddError(`Channel "${name}" already exists.`);
			return;
		}

		const draft = ensureFullOverridesForChannel(createDraftChannel(server.guildId, roleSnapshot, name), roleSnapshot);

		setChannelsDraft((current) => [...current, draft]);
		setSelectedChannelId(draft.channelId);

		setIsAddingChannel(false);
		setNewChannelName("");
	};

	const removeChannelFromDraft = (channelId: string) => {
		setChannelsDraft((current) => current.filter((c) => c.channelId !== channelId));
		setSelectedChannelId((currentSelected) => {
			if (currentSelected !== channelId) {
				return currentSelected;
			}
			const remaining = channelsDraft.filter((c) => c.channelId !== channelId);
			return remaining[0]?.channelId ?? "";
		});
	};

	const handleRemoveSelectedChannel = () => {
		setChannelAddError(null);

		if (!selectedChannel) {
			return;
		}

		if (channelsDraft.length <= 1) {
			setChannelAddError("You must keep at least one channel.");
			return;
		}

		const ok = window.confirm(`Remove channel "#${selectedChannel.name}"? It will be deleted after you click "Save changes".`);
		if (!ok) {
			return;
		}

		const channelId = selectedChannel.channelId;
		removeChannelFromDraft(channelId);
	};

	const handleDeleteServer = async () => {
		setSaveError(null);

		if (!api) {
			setSaveError("Missing API (auth). Please sign in again.");
			return;
		}

		const ok = window.confirm(`Delete server "${server.name}"? This cannot be undone.`);
		if (!ok) {
			return;
		}

		setIsDeleting(true);
		try {
			await api.deleteGuild(server.guildId);
			if (onDeleted) {
				onDeleted(server.guildId);
			} else {
				setSaveError("Server deleted. Close this panel and refresh the list.");
			}
		} catch (e) {
			setSaveError(getErrorText(e));
		} finally {
			setIsDeleting(false);
		}
	};

	const handleSaveAll = async (event: React.FormEvent) => {
		event.preventDefault();
		setSaveError(null);

		if (!api) {
			setSaveError("Missing API (auth). Please sign in again.");
			return;
		}

		const name = guildName.trim();
		if (!name) {
			setSaveError("Server name is required.");
			return;
		}

		const roleNameError = validateUniqueRoleNames(roles);
		if (roleNameError) {
			setSaveError(roleNameError);
			return;
		}

		setIsSaving(true);

		try {
			const nextChannels: DrocsidChannel[] = channelsDraft.map((c) => ensureFullOverridesForChannel(c, roleSnapshot));
			const nextUsers: DrocsidGuildUser[] = usersDraft.map((u) => {
				const ids = ensureEveryone(getUserRoleIds(u));
				return setUserRoleIds(u, roleSnapshot, ids);
			});

			await api.putGuild(server.guildId, {
				guildId: server.guildId,
				name,
				icon: guildIcon.trim(),
				ownerId: server.ownerId,
			});

			const updatableRoles = roles.filter((r) => !r.system);
			// await Promise.all(
			// 	updatableRoles.map((r) =>
			// 		api.putRole(server.guildId, r.guildRoleId, {
			// 			roleName: r.roleName.trim(),
			// 			permissions: recordToPermissionsString(r.permissions),
			// 		})
			// 	)
			// );

			const originalRealChannelIds = (server.channels ?? []).map((c) => c.channelId).filter((id) => id.length > 0 && !isTempChannelId(id));

			const keptRealChannelIds = new Set(nextChannels.map((c) => c.channelId).filter((id) => id.length > 0 && !isTempChannelId(id)));

			const removedRealChannelIds = originalRealChannelIds.filter((id) => !keptRealChannelIds.has(id));
			if (removedRealChannelIds.length > 0) {
				await Promise.all(removedRealChannelIds.map((id) => api.deleteChannel(id)));
			}

			const results = await Promise.all(
				nextChannels.map(async (ch) => {
					console.log("saving channel", ch);
					const payload = buildChannelPayload(ch, server.guildId);

					if (isTempChannelId(ch.channelId)) {
						const created = await api.createChannel(server.guildId, payload.name);
						const realId = created.channelId ?? "";
						if (!realId) {
							throw new Error("Backend did not return channelId for created channel");
						}

						await api.putChannel(realId, payload);

						return { tempId: ch.channelId, realId };
					}

					await api.putChannel(ch.channelId, payload);
					return null;
				})
			);

			const tempToReal = new Map<string, string>();
			for (const r of results) {
				if (r) {
					tempToReal.set(r.tempId, r.realId);
				}
			}

			if (tempToReal.size > 0) {
				setChannelsDraft((current) =>
					current.map((c) => {
						const real = tempToReal.get(c.channelId);
						return real ? { ...c, channelId: real } : c;
					})
				);

				setSelectedChannelId((current) => tempToReal.get(current) ?? current);
			}

			await Promise.all(
				nextUsers.map((u) =>
					api.putGuildUser(server.guildId, u.guildUserId, {
						guildUserId: u.guildUserId,
						nick: u.nick.trim(),
						roles: {
							roles: (u.roles?.roles ?? []).map((r) => ({
								guildRoleId: r.guildRoleId,
								roleName: r.roleName,
								permissions: r.permissionsRaw ?? "",
							})),
						},
					})
				)
			);

			const [guildDto, rolesDto, channelsDto, usersDto] = await Promise.all([api.getGuild(server.guildId), api.getRoles(server.guildId), api.getAllChannels(server.guildId), api.getGuildUsers(server.guildId)]);

			const refreshed: DrocsidGuild = {
				...mapGuildDto(guildDto),
				roles: (rolesDto.roles ?? []).map(mapRoleDto),
				channels: (channelsDto.channels ?? []).map(mapChannelDto),
				users: (usersDto.guildUsers ?? []).map(mapGuildUserDto),
			};

			setGuildName(refreshed.name ?? "");
			setGuildIcon(refreshed.icon ?? "");
			setRoles(rolesToRoleForms(refreshed.roles));

			const refreshedRoles = refreshed.roles ?? [];
			setChannelsDraft((refreshed.channels ?? []).map((c) => ensureFullOverridesForChannel(cloneChannel(c), refreshedRoles)));
			setUsersDraft((refreshed.users ?? []).map(cloneUser));

			onSaved(refreshed);
		} catch (e) {
			setSaveError(getErrorText(e));
		} finally {
			setIsSaving(false);
		}
	};

	const renderGeneral = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">General</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>Server identity and basic info.</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Name</span>
						<input value={guildName} onChange={(event) => setGuildName(event.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`} />
					</label>

					<label className="flex flex-col gap-1 text-sm">
						<span className={`font-medium ${ui.label}`}>Icon</span>
						<input value={guildIcon} onChange={(event) => setGuildIcon(event.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`} placeholder="✨" />
					</label>
				</div>

				<div className={`rounded-xl border p-4 ${ui.border}`}>
					<div className="mb-3">
						<div className="text-sm font-semibold">Invites</div>
						<div className={`text-xs mt-1 ${ui.muted}`}>Generate a link to invite someone to this server.</div>
					</div>

					<DrocsidInvitePanel guildId={server.guildId} channels={channelsDraft} preferredChannelId={selectedChannelId || null} />
				</div>

				<div className={`rounded-xl border p-4 ${ui.border}`}>
					<div className="flex items-start justify-between gap-4">
						<div>
							<div className="text-sm font-semibold">Danger zone</div>
							<div className={`text-xs mt-1 ${ui.muted}`}>Permanent actions. Be careful.</div>
						</div>

						<button
							type="button"
							onClick={handleDeleteServer}
							// disabled={isSaving || isDeleting}
							disabled={true}
							className={`px-4 py-2 text-sm rounded-lg border transition disabled:opacity-60 ${ui.buttonDanger}`}>
							{isDeleting ? "Deleting..." : "Deleting blocked"}
						</button>
					</div>
				</div>
			</div>
		);
	};

	const renderRoles = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Roles</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>Edit permissions for each role.</p>
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
							</tr>
						</thead>

						<tbody>
							{roles.map((role) => {
								const disabled = !!role.system;
								const preview = recordToPermissionsString(role.permissions);

								return (
									<tr key={role.guildRoleId} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
										<td className="px-3 py-2 align-top">
											<input
												value={role.roleName}
												disabled={disabled}
												onChange={(event) => handleRenameRole(role.guildRoleId, event.target.value)}
												className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input} disabled:opacity-60`}
											/>
											{disabled && <div className={`text-[10px] mt-1 ${ui.muted}`}>System role</div>}
										</td>

										{PERMISSION_FLAGS.map((flag) => (
											<td key={flag} className="px-3 py-2 text-center align-middle">
												<label className="inline-flex items-center justify-center" title={flag}>
													<input type="checkbox" disabled={disabled} checked={role.permissions[flag]} onChange={() => handleToggleRolePermission(role.guildRoleId, flag)} className="h-4 w-4 disabled:opacity-60" />
												</label>
											</td>
										))}

										<td className="px-3 py-2 align-middle">
											<div className={`px-2 py-1 rounded border text-[11px] ${ui.box}`}>{preview || "-"}</div>
										</td>
									</tr>
								);
							})}

							{roles.length === 0 && (
								<tr>
									<td colSpan={PERMISSION_FLAGS.length + 2} className={`px-3 py-6 text-sm ${ui.muted}`}>
										No roles.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className={`text-[11px] ${ui.muted}`}>System roles are read-only.</div>
			</div>
		);
	};

	const renderChannels = () => {
		const channelId = selectedChannel?.channelId ?? "";
		const channelName = selectedChannel?.name ?? "";
		const overrideRows = buildOverrideRows(roleSnapshot, selectedChannel?.overrides?.roles);

		const canRemoveSelected = !!selectedChannel && channelsDraft.length > 1;

		return (
			<div className="space-y-6">
				<div className="flex items-start justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold">Channels</h3>
						<p className={`text-xs mt-1 ${ui.muted}`}>Edit channel name and per-role overrides.</p>
					</div>

					<div className="flex items-center gap-2">
						{!isAddingChannel ? (
							<>
								<button type="button" className={`px-3 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={startAddChannel} disabled={isSaving || isDeleting}>
									Add channel
								</button>

								<button
									type="button"
									className={`px-3 py-2 text-sm rounded-lg border transition disabled:opacity-60 ${ui.buttonDanger}`}
									onClick={handleRemoveSelectedChannel}
									disabled={isSaving || isDeleting || !canRemoveSelected}
									title={canRemoveSelected ? "Remove selected channel" : "You must keep at least one channel"}>
									Remove channel
								</button>
							</>
						) : (
							<div className="flex items-center gap-2">
								<input
									value={newChannelName}
									onChange={(e) => setNewChannelName(e.target.value)}
									placeholder="new-channel"
									className={`w-56 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
								/>
								<button type="button" className={`px-3 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={confirmAddChannel} disabled={isSaving || isDeleting}>
									Create
								</button>
								<button type="button" className={`px-3 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={cancelAddChannel} disabled={isSaving || isDeleting}>
									Cancel
								</button>
							</div>
						)}
					</div>
				</div>

				{channelAddError && <div className="text-xs text-red-400">{channelAddError}</div>}

				<div className={`text-[11px] ${ui.muted}`}>
					Removed channels are deleted from the backend after you click <span className="font-medium">Save changes</span>.
				</div>

				<label className="flex flex-col gap-1 text-sm">
					<span className={`font-medium ${ui.label}`}>Channel</span>
					<select value={channelId} onChange={(e) => setSelectedChannelId(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}>
						{channelsDraft.map((c) => (
							<option key={c.channelId} value={c.channelId}>
								#{c.name}
							</option>
						))}
					</select>
				</label>

				{selectedChannel && (
					<div className="space-y-4">
						<label className="flex flex-col gap-1 text-sm">
							<span className={`font-medium ${ui.label}`}>Name</span>
							<input
								value={channelName}
								onChange={(event) => updateSelectedChannel((ch) => ({ ...ch, name: event.target.value }))}
								className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
							/>
						</label>

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
									</tr>
								</thead>

								<tbody>
									{overrideRows.map((row) => (
										<tr key={row.guildRoleId} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
											<td className="px-3 py-2 align-top">
												<div className="font-medium">{row.roleName}</div>
												{row.system && <div className={`text-[10px] mt-1 ${ui.muted}`}>System role</div>}
											</td>

											{PERMISSION_FLAGS.map((flag) => (
												<td key={flag} className="px-3 py-2 text-center align-middle">
													<label className="inline-flex items-center justify-center" title={flag}>
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

						<div className={`text-[11px] ${ui.muted}`}>Overrides are generated for every role to keep backend contract stable.</div>
					</div>
				)}
			</div>
		);
	};

	const renderMembers = () => {
		const visibleRoles = roleSnapshot;
		const q = memberFilter.trim().toLowerCase();

		const filtered = q ? usersDraft.filter((u) => (u.nick ?? "").toLowerCase().includes(q)) : usersDraft;

		return (
			<div className="space-y-6">
				<div className="flex items-end justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold">Members</h3>
						<p className={`text-xs mt-1 ${ui.muted}`}>Edit nicknames and role assignment.</p>
					</div>

					<div className="w-64">
						<input
							value={memberFilter}
							onChange={(e) => setMemberFilter(e.target.value)}
							placeholder="Search members..."
							className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
						/>
					</div>
				</div>

				<div className={`overflow-auto border rounded-xl ${ui.border}`}>
					<table className="min-w-full text-xs">
						<thead className={`${ui.tableHead} border-b ${ui.border}`}>
							<tr>
								<th className={`text-left px-3 py-2 font-medium w-60 ${ui.label}`}>Nickname</th>
								{visibleRoles.map((r) => (
									<th key={r.guildRoleId} className={`text-left px-3 py-2 font-medium ${ui.label}`}>
										{r.roleName}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{filtered.map((u) => {
								const ids = getUserRoleIds(u);

								return (
									<tr key={u.guildUserId} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
										<td className="px-3 py-2 align-top">
											<input
												value={u.nick}
												onChange={(e) => updateUserNick(u.guildUserId, e.target.value)}
												className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
											/>
										</td>

										{visibleRoles.map((r) => {
											const isOwner = r.roleName === "@owner";
											const isEveryone = r.roleName === "@everyone";
											const checked = isEveryone ? true : ids.includes(r.guildRoleId);

											return (
												<td key={r.guildRoleId} className="px-3 py-2 text-center align-middle">
													<label className="inline-flex items-center justify-center" title={r.roleName}>
														<input type="checkbox" checked={checked} disabled={isOwner || isEveryone} onChange={() => toggleUserRole(u.guildUserId, r.guildRoleId)} className="h-4 w-4" />
													</label>
												</td>
											);
										})}
									</tr>
								);
							})}

							{filtered.length === 0 && (
								<tr>
									<td colSpan={visibleRoles.length + 1} className={`px-3 py-6 text-sm ${ui.muted}`}>
										No members found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className={`text-[11px] ${ui.muted}`}>@everyone is always enabled. @owner is protected.</div>
			</div>
		);
	};

	const sectionContent = activeSection === "general" ? renderGeneral() : activeSection === "roles" ? renderRoles() : activeSection === "channels" ? renderChannels() : renderMembers();

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel}`}>
			<header className="mb-4">
				<h2 className="text-lg font-semibold">Server settings</h2>
				<p className={`text-xs mt-1 ${ui.muted}`}>Edit your server configuration.</p>
				{saveError && <div className="mt-2 text-xs text-red-400">{saveError}</div>}
			</header>

			<div className="flex-1 flex gap-6 overflow-hidden">
				<nav className={`w-52 shrink-0 border-r pr-4 ${ui.border}`}>
					<ul className="space-y-1 text-sm">
						<li>
							<button type="button" onClick={() => setActiveSection("general")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "general" ? ui.navActive : ui.navIdle}`}>
								General
							</button>
						</li>
						<li>
							<button type="button" onClick={() => setActiveSection("roles")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "roles" ? ui.navActive : ui.navIdle}`}>
								Roles
							</button>
						</li>
						<li>
							<button type="button" onClick={() => setActiveSection("channels")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "channels" ? ui.navActive : ui.navIdle}`}>
								Channels
							</button>
						</li>
						<li>
							<button type="button" onClick={() => setActiveSection("members")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "members" ? ui.navActive : ui.navIdle}`}>
								Members
							</button>
						</li>
					</ul>
				</nav>

				<form className="flex-1 flex flex-col gap-6 overflow-auto" onSubmit={handleSaveAll}>
					{sectionContent}

					<div className={`border-t pt-4 mt-auto flex justify-end gap-3 ${ui.border}`}>
						<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={resetAll} disabled={isSaving || isDeleting}>
							Reset
						</button>

						<button type="submit" className={`px-4 py-2 text-sm rounded-lg transition ${ui.buttonPrimary} disabled:opacity-60`} disabled={isSaving || isDeleting || !isDirty}>
							{isSaving ? "Saving..." : "Save changes"}
						</button>
					</div>

					{!isDirty && <div className={`text-[11px] ${ui.muted} -mt-3`}>No changes to save.</div>}
				</form>
			</div>
		</section>
	);
}
