import React, { useEffect, useMemo, useState } from "react";
import type { DrocsidChannel, DrocsidGuild, DrocsidRole } from "../types";
import { useDrocsidTheme } from "../theme-provider";
import {
	PERMISSION_FLAGS,
	type PermissionFlag,
	type PermissionsRecord,
	permissionsListToRecord,
	recordToPermissionsList,
	recordToPermissionsString,
} from "../permissions";

type OverrideRow = {
	guildRoleId: string;
	roleName: string;
	system?: boolean;
	permissions: PermissionsRecord;
};

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

function normalizeName(value: string): string {
	return value.trim().toLowerCase();
}

type DrocsidChannelSettingsProps = {
	callerId: string;
	server: DrocsidGuild | null;
	channel: DrocsidChannel | null;
	onCancel: () => void;
	onSaved: (nextChannel: DrocsidChannel) => void;
};

export function DrocsidChannelSettings(props: DrocsidChannelSettingsProps) {
	/**
	 * Channel settings editor:
	 * - edits channel name
	 * - edits per-role overrides for permissions
	 * Notes:
	 * - hides internal IDs in UI (production)
	 * - keeps backend compatibility by producing permissionsRaw string in role overrides
	 */
	const { server, channel, onCancel, onSaved } = props;

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
			badge: isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-700",
		};
	}, [isDark]);

	const [activeSection, setActiveSection] = useState<"general" | "overrides">("general");
	const [channelName, setChannelName] = useState(channel?.name ?? "");
	const [rows, setRows] = useState<OverrideRow[]>(() => buildOverrideRows(server?.roles ?? [], channel?.overrides?.roles));
	const [roleFilter, setRoleFilter] = useState("");

	useEffect(() => {
		setChannelName(channel?.name ?? "");
		setRows(buildOverrideRows(server?.roles ?? [], channel?.overrides?.roles));
		setActiveSection("general");
		setRoleFilter("");
	}, [server?.guildId, channel?.channelId]);

	const baselineKey = useMemo(() => {
		if (!server || !channel) {
			return "";
		}

		const baseRows = buildOverrideRows(server.roles ?? [], channel.overrides?.roles).map((r) => ({
			id: r.guildRoleId,
			raw: recordToPermissionsString(r.permissions),
		}));

		return JSON.stringify({
			name: channel.name ?? "",
			rows: baseRows,
		});
	}, [server, channel]);

	const draftKey = useMemo(() => {
		const draftRows = rows.map((r) => ({
			id: r.guildRoleId,
			raw: recordToPermissionsString(r.permissions),
		}));

		return JSON.stringify({
			name: channelName,
			rows: draftRows,
		});
	}, [rows, channelName]);

	const isDirty = baselineKey !== "" && baselineKey !== draftKey;

	if (!server || !channel) {
		return (
			<section className={`h-full rounded-2xl border p-4 shadow-sm ${ui.panel}`}>
				<h2 className="text-lg font-semibold">Channel settings</h2>
				<p className={`text-sm mt-2 ${ui.muted}`}>No server or channel selected.</p>
			</section>
		);
	}

	const handleTogglePermission = (guildRoleId: string, flag: PermissionFlag) => {
		setRows((current) =>
			current.map((r) => {
				if (r.guildRoleId !== guildRoleId) {
					return r;
				}
				return { ...r, permissions: { ...r.permissions, [flag]: !r.permissions[flag] } };
			})
		);
	};

	const resetAll = () => {
		setChannelName(channel.name ?? "");
		setRows(buildOverrideRows(server.roles ?? [], channel.overrides?.roles));
		setActiveSection("general");
		setRoleFilter("");
	};

	const handleSave = (event: React.FormEvent) => {
		event.preventDefault();

		const name = channelName.trim();
		if (!name) {
			return;
		}

		const nextOverrides: DrocsidRole[] = rows.map((r) => {
			const raw = recordToPermissionsString(r.permissions);
			return {
				guildRoleId: r.guildRoleId,
				roleName: r.roleName,
				system: r.system,
				permissions: recordToPermissionsList(r.permissions),
				permissionsRaw: raw,
			};
		});

		const nextChannel: DrocsidChannel = {
			...channel,
			name,
			overrides: { roles: nextOverrides },
		};

		onSaved(nextChannel);
	};

	const filteredRows = useMemo(() => {
		const q = normalizeName(roleFilter);
		if (!q) {
			return rows;
		}
		return rows.filter((r) => normalizeName(r.roleName).includes(q));
	}, [rows, roleFilter]);

	const renderGeneral = () => {
		const safeName = channelName.trim();
		const preview = safeName ? `#${safeName}` : "#channel";

		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-semibold">General</h3>
					<p className={`text-xs mt-1 ${ui.muted}`}>Basic channel info.</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						<span className={`font-medium ${ui.label}`}>Name</span>
						<input
							value={channelName}
							onChange={(event) => setChannelName(event.target.value)}
							className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
							placeholder="general"
						/>
						<span className={`text-xs ${ui.muted}`}>Preview: {preview}</span>
					</label>

					<div className="md:col-span-2">
						<div className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg border ${ui.box}`}>
							<span className={`px-2 py-0.5 rounded-md ${ui.badge}`}>Server</span>
							<span className="font-medium">{server.name}</span>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderOverrides = () => {
		return (
			<div className="space-y-6">
				<div className="flex items-end justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold">Overrides</h3>
						<p className={`text-xs mt-1 ${ui.muted}`}>Fine-tune permissions per role for this channel.</p>
					</div>

					<div className="w-64">
						<input
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							placeholder="Search roles..."
							className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}
						/>
					</div>
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
							{filteredRows.map((row) => {
								const preview = recordToPermissionsString(row.permissions);

								return (
									<tr key={row.guildRoleId} className={`border-t ${ui.border} ${ui.tableRowHover}`}>
										<td className="px-3 py-2 align-top">
											<div className="font-medium">{row.roleName}</div>
											{row.system && <div className={`text-[10px] mt-1 ${ui.muted}`}>System role</div>}
										</td>

										{PERMISSION_FLAGS.map((flag) => (
											<td key={flag} className="px-3 py-2 text-center align-middle">
												<label className="inline-flex items-center justify-center" title={flag}>
													<input type="checkbox" checked={row.permissions[flag]} onChange={() => handleTogglePermission(row.guildRoleId, flag)} className="h-4 w-4" />
												</label>
											</td>
										))}

										<td className="px-3 py-2 align-middle">
											<div className={`px-2 py-1 rounded border text-[11px] ${ui.box}`}>{preview || "-"}</div>
										</td>
									</tr>
								);
							})}

							{filteredRows.length === 0 && (
								<tr>
									<td colSpan={PERMISSION_FLAGS.length + 2} className={`px-3 py-6 text-sm ${ui.muted}`}>
										No roles found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className={`text-[11px] ${ui.muted}`}>Overrides are generated for every role to keep backend contract stable.</div>
			</div>
		);
	};

	const sectionContent = activeSection === "general" ? renderGeneral() : renderOverrides();

	return (
		<section className={`h-full rounded-2xl border p-4 shadow-sm flex flex-col ${ui.panel}`}>
			<header className="mb-4">
				<h2 className="text-lg font-semibold">Channel settings</h2>
				<p className={`text-xs mt-1 ${ui.muted}`}>Edit channel configuration.</p>
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
								onClick={() => setActiveSection("overrides")}
								className={`w-full text-left px-3 py-2 rounded-lg transition ${activeSection === "overrides" ? ui.navActive : ui.navIdle}`}>
								Overrides
							</button>
						</li>
					</ul>
				</nav>

				<form className="flex-1 flex flex-col gap-6 overflow-auto" onSubmit={handleSave}>
					{sectionContent}

					<div className={`border-t pt-4 mt-auto flex justify-end gap-3 ${ui.border}`}>
						<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={resetAll}>
							Reset
						</button>

						<button type="button" className={`px-4 py-2 text-sm rounded-lg border transition ${ui.buttonGhost}`} onClick={onCancel}>
							Close
						</button>

						<button type="submit" className={`px-4 py-2 text-sm rounded-lg transition ${ui.buttonPrimary} disabled:opacity-60`} disabled={!isDirty}>
							Save changes
						</button>
					</div>

					{!isDirty && <div className={`text-[11px] ${ui.muted} -mt-3`}>No changes to save.</div>}
				</form>
			</div>
		</section>
	);
}
