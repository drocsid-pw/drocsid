import React, { useEffect, useMemo, useState } from "react";
import type { DrocsidChannel, DrocsidRole, DrocsidServer } from "../types";
import { useDrocsidTheme } from "../theme-provider";
import { PERMISSION_FLAGS, type PermissionFlag, permissionsListToRecord, recordToPermissionsString, recordToPermissionsList } from "../permissions";

type ProtoRole = {
	guild_role_id: string;
	role_name: string;
	permissions: string;
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

type OverrideRow = {
	guild_role_id: string;
	role_name: string;
	permissions: ReturnType<typeof permissionsListToRecord>;
};

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

export function DrocsidChannelSettings(props: { callerId: string; server: DrocsidServer | null; channel: DrocsidChannel | null; onCancel: () => void; onSaved: (nextChannel: DrocsidChannel) => void }) {
	const { callerId, server, channel, onCancel, onSaved } = props;

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

	const [activeSection, setActiveSection] = useState<"general" | "overrides">("general");

	const [channelName, setChannelName] = useState(channel?.name ?? "");
	const [rows, setRows] = useState<OverrideRow[]>(() => buildOverrideRows(server?.roles ?? [], channel?.overrides));

	useEffect(() => {
		setChannelName(channel?.name ?? "");
		setRows(buildOverrideRows(server?.roles ?? [], channel?.overrides));
		setActiveSection("general");
	}, [server?.id, channel?.id]);

	if (!server || !channel) {
		return (
			<section className={`h-full rounded-2xl border p-4 shadow-sm ${ui.panel}`}>
				<h2 className="text-lg font-semibold">Ustawienia kanału</h2>
				<p className={`text-sm mt-2 ${ui.muted}`}>Brak serwera albo kanału.</p>
			</section>
		);
	}

	const guildId = server.id;
	const channelId = channel.id;

	const handleTogglePermission = (roleId: string, flag: PermissionFlag) => {
		setRows((current) =>
			current.map((r) => {
				if (r.guild_role_id !== roleId) {
					return r;
				}
				return {
					...r,
					permissions: {
						...r.permissions,
						[flag]: !r.permissions[flag],
					},
				};
			})
		);
	};

	const handleSave = (event: React.FormEvent) => {
		event.preventDefault();

		const overridesRoles: ProtoRole[] = rows.map((r) => ({
			guild_role_id: r.guild_role_id,
			role_name: r.role_name,
			permissions: recordToPermissionsString(r.permissions),
		}));

		const req: ProtoUpdateChannelRequest = {
			caller_id: callerId,
			channel: {
				channel_id: channelId,
				name: channelName.trim(),
				guild_id: guildId,
				overrides: { roles: overridesRoles },
			},
		};

		alert(["ChannelService.UpdateChannel(UpdateChannelRequest)", JSON.stringify(req, null, 2)].join("\n"));

		const nextChannel: DrocsidChannel = {
			...channel,
			name: channelName.trim(),
			overrides: rows.map((r) => ({
				id: r.guild_role_id,
				name: r.role_name,
				permissions: recordToPermissionsList(r.permissions),
			})),
		};

		onSaved(nextChannel);
	};

	const renderGeneral = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Ogólne</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>channel.Channel</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						<span className={`font-medium ${ui.label}`}>Nazwa kanału</span>
						<input value={channelName} onChange={(event) => setChannelName(event.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`} />
						<span className={`text-xs ${ui.muted}`}>channel.name</span>
					</label>

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
		);
	};

	const renderOverrides = () => {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">Overrides ról</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>channel.Channel.overrides: role.RoleList</p>
				</div>

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
							{rows.map((row) => (
								<tr key={row.guild_role_id} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
									<td className="px-3 py-2 align-top">
										<div className="font-medium">{row.role_name}</div>
										<div className={`text-[10px] mt-1 ${ui.muted}`}>{row.guild_role_id}</div>
									</td>

									{PERMISSION_FLAGS.map((flag) => (
										<td key={flag} className="px-3 py-2 text-center align-middle">
											<label className="inline-flex items-center justify-center">
												<input type="checkbox" checked={row.permissions[flag]} onChange={() => handleTogglePermission(row.guild_role_id, flag)} className="h-4 w-4" />
											</label>
										</td>
									))}

									<td className="px-3 py-2 align-middle">
										<div className={`px-2 py-1 rounded border text-[11px] ${ui.box}`}>{recordToPermissionsString(row.permissions) || "-"}</div>
									</td>
								</tr>
							))}

							{rows.length === 0 && (
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
		);
	};

	const sectionContent = activeSection === "general" ? renderGeneral() : renderOverrides();

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel}`}>
			<header className="mb-4">
				<h2 className="text-lg font-semibold">Ustawienia kanału</h2>
				<p className={`text-xs mt-1 ${ui.muted}`}>UpdateChannel + overrides</p>
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
							<button type="button" onClick={() => setActiveSection("overrides")} className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "overrides" ? ui.navActive : ui.navIdle}`}>
								Overrides
							</button>
						</li>
					</ul>
				</nav>

				<form className="flex-1 flex flex-col gap-6 overflow-auto" onSubmit={handleSave}>
					{sectionContent}

					<div className={`border-t pt-4 mt-auto flex justify-end gap-3 ${ui.border}`}>
						<button
							type="button"
							className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`}
							onClick={() => {
								setChannelName(channel.name);
								setRows(buildOverrideRows(server.roles ?? [], channel.overrides));
								setActiveSection("general");
							}}>
							Przywróć
						</button>
						<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={onCancel}>
							Zamknij
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
