import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { DrocsidChannel, DrocsidFriend, DrocsidGuild, DrocsidUser } from "../types";
import { DrocsidServersBar } from "./DrocsidServersBar";
import { DrocsidChannelsBar } from "./DrocsidChannelsBar";
import { DrocsidChatView } from "./DrocsidChatView";
import { DrocsidUserSettings } from "./DrocsidUserSettings";
import { DrocsidServerSettings } from "./DrocsidServerSettings";
import { DrocsidCreateServer } from "./DrocsidCreateServer";
import { useDrocsidTheme } from "../theme-provider";
import { useAuth } from "../../../auth/auth";
import { useDrocsidApi } from "../../../api/useDrocsidApi";
import { isDrocsidApiError } from "../../../api/http";
import { avatarLetterFromName, mapChannelDto, mapGuildDto, mapGuildUserDto, mapMessageDto, mapRoleDto, mapUserDto } from "../mappers";

type DrocsidViewMode = "chat" | "userSettings" | "serverSettings" | "createServer";
type DrocsidSideMode = "servers" | "friends";

const DROCSID_LAYOUT = {
	serversWidth: "6vw",
	channelsWidth: "20vw",
	mainWidth: "74vw",
};

function replaceServer(servers: DrocsidGuild[], next: DrocsidGuild) {
	return servers.map((s) => (s.guildId === next.guildId ? next : s));
}

function mergeGuildSummaries(prev: DrocsidGuild[], next: DrocsidGuild[]): DrocsidGuild[] {
	const byId = new Map(prev.map((g) => [g.guildId, g]));
	return next.map((g) => {
		const existing = byId.get(g.guildId);
		if (!existing) {
			return g;
		}
		return {
			...existing,
			guildId: g.guildId,
			name: g.name,
			icon: g.icon,
			ownerId: g.ownerId,
			roles: g.roles.length ? g.roles : existing.roles,
		};
	});
}

function getErrorText(err: unknown): string {
	if (isDrocsidApiError(err)) {
		return `${err.code}: ${err.message}`;
	}
	if (err instanceof Error) {
		return err.message;
	}
	return "Nieznany błąd";
}

export function DrocsidMainView() {
	const { theme } = useDrocsidTheme();
	const api = useDrocsidApi();
	const { callerId, payload, clearToken } = useAuth();

	const [bootError, setBootError] = useState<string | null>(null);
	const [isBooting, setIsBooting] = useState(true);

	const [currentUser, setCurrentUser] = useState<DrocsidUser | null>(null);

	const [servers, setServers] = useState<DrocsidGuild[]>([]);
	const [viewMode, setViewMode] = useState<DrocsidViewMode>("chat");
	const [sideMode, setSideMode] = useState<DrocsidSideMode>("servers");

	const [activeServerId, setActiveServerId] = useState<string | null>(null);
	const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

	const [isSending, setIsSending] = useState(false);

	const friends: DrocsidFriend[] = [];
	const activeFriendId: string | null = null;

	const fallbackUser: DrocsidUser | null = useMemo(() => {
		if (!callerId) {
			return null;
		}
		const name = payload?.name ?? "Ty";
		return {
			id: callerId,
			name,
			avatarHash: "",
			avatarLetter: avatarLetterFromName(name),
		};
	}, [callerId, payload?.name]);

	const ensureUser = useCallback(async () => {
		if (!api || !callerId) {
			return null;
		}

		try {
			const dto = await api.getCurrentUser();
			return mapUserDto(dto, { id: callerId, name: payload?.name ?? undefined });
		} catch (e) {
			if (!isDrocsidApiError(e) || e.code !== "NOT_FOUND") {
				throw e;
			}

			const name = (payload?.name ?? "drocsid user").trim() || "drocsid user";
			await api.createUser(name);

			try {
				const dto = await api.getCurrentUser();
				return mapUserDto(dto, { id: callerId, name: payload?.name ?? undefined });
			} catch {
				return {
					id: callerId,
					name,
					avatarHash: "",
					avatarLetter: avatarLetterFromName(name),
				};
			}
		}
	}, [api, callerId, payload?.name]);

	const reloadGuilds = useCallback(
		async (selectGuildId?: string | null) => {
			if (!api || !callerId) {
				return;
			}

			const list = await api.getAllGuilds(callerId);
			const guilds = (list.guilds ?? []).map(mapGuildDto);

			setServers((prev) => mergeGuildSummaries(prev, guilds));

			const nextActive = selectGuildId ?? activeServerId;
			if (nextActive && guilds.some((g) => g.guildId === nextActive)) {
				setActiveServerId(nextActive);
			} else {
				setActiveServerId(guilds[0]?.guildId ?? null);
			}
		},
		[api, callerId, activeServerId]
	);

	useEffect(() => {
		if (!api || !callerId) {
			setIsBooting(false);
			setBootError("Brak tokenu lub callerId. Zaloguj się ponownie.");
			return;
		}

		let cancelled = false;

		(async () => {
			try {
				setIsBooting(true);
				setBootError(null);

				const [user] = await Promise.all([ensureUser(), reloadGuilds(null)]);

				if (cancelled) {
					return;
				}

				setCurrentUser(user ?? fallbackUser);
			} catch (e) {
				if (cancelled) {
					return;
				}
				setBootError(getErrorText(e));
			} finally {
				if (!cancelled) {
					setIsBooting(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [api, callerId, ensureUser, reloadGuilds, fallbackUser]);

	const activeServer = useMemo<DrocsidGuild | null>(() => {
		if (servers.length === 0) {
			return null;
		}
		if (!activeServerId) {
			return servers[0] ?? null;
		}
		return servers.find((s) => s.guildId === activeServerId) ?? servers[0] ?? null;
	}, [servers, activeServerId]);

	useEffect(() => {
		if (!api || !activeServer?.guildId) {
			return;
		}

		let cancelled = false;

		(async () => {
			try {
				const guildId = activeServer.guildId;

				const [guildDto, rolesDto, channelsDto, usersDto] = await Promise.all([api.getGuild(guildId), api.getRoles(guildId), api.getAllChannels(guildId), api.getGuildUsers(guildId)]);

				if (cancelled) {
					return;
				}

				const mergedRoles = (rolesDto.roles ?? []).map(mapRoleDto);

				setServers((prev) =>
					prev.map((g) => {
						if (g.guildId !== guildId) {
							return g;
						}

						const base = mapGuildDto(guildDto);
						const prevChannelsById = new Map((g.channels ?? []).map((c) => [c.channelId, c]));
						const nextChannels = (channelsDto.channels ?? []).map((c) => {
							const mapped = mapChannelDto(c);
							const existing = prevChannelsById.get(mapped.channelId);
							return existing ? { ...mapped, messages: existing.messages } : mapped;
						});

						return {
							...g,
							...base,
							roles: mergedRoles.length ? mergedRoles : base.roles,
							channels: nextChannels,
							users: (usersDto.guildUsers ?? []).map(mapGuildUserDto),
						};
					})
				);
			} catch (e) {
				setBootError(getErrorText(e));
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [api, activeServer?.guildId]);

	const channels = useMemo<DrocsidChannel[]>(() => activeServer?.channels ?? [], [activeServer]);

	useEffect(() => {
		if (!activeServer) {
			setActiveChannelId(null);
			return;
		}

		if (channels.length === 0) {
			setActiveChannelId(null);
			return;
		}

		const exists = activeChannelId ? channels.some((c) => c.channelId === activeChannelId) : false;
		if (!exists) {
			setActiveChannelId(channels[0]?.channelId ?? null);
		}
	}, [activeServer?.guildId, channels, activeChannelId, activeServer]);

	const activeChannel = useMemo<DrocsidChannel | null>(() => {
		if (!activeServer || channels.length === 0) {
			return null;
		}
		if (!activeChannelId) {
			return channels[0] ?? null;
		}
		return channels.find((c) => c.channelId === activeChannelId) ?? channels[0] ?? null;
	}, [activeServer, channels, activeChannelId]);

	useEffect(() => {
		if (!api || !activeChannelId || !activeServer?.guildId) {
			return;
		}

		let cancelled = false;

		(async () => {
			try {
				const list = await api.getMessages(activeChannelId, 0, 50);
				if (cancelled) {
					return;
				}

				const mapped = (list.messages ?? []).map((m) => mapMessageDto(m));

				setServers((prev) =>
					prev.map((g) => {
						if (g.guildId !== activeServer.guildId) {
							return g;
						}

						return {
							...g,
							channels: (g.channels ?? []).map((ch) => (ch.channelId === activeChannelId ? { ...ch, messages: mapped } : ch)),
						};
					})
				);
			} catch (e) {
				setBootError(getErrorText(e));
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [api, activeChannelId, activeServer?.guildId]);

	const serverMessages = useMemo(() => activeChannel?.messages ?? [], [activeChannel]);

	const handleSendChannelMessage = useCallback(
		async (content: string) => {
			if (!api || !activeServer?.guildId || !activeChannel?.channelId) {
				return;
			}

			const trimmed = content.trim();
			if (!trimmed) {
				return;
			}

			setIsSending(true);

			try {
				const dto = await api.createMessage(activeChannel.channelId, trimmed);
				const msg = mapMessageDto(dto, { timestamp: dto.timestamp ?? new Date().toISOString() });

				setServers((prev) =>
					prev.map((g) => {
						if (g.guildId !== activeServer.guildId) {
							return g;
						}

						return {
							...g,
							channels: g.channels.map((ch) => {
								if (ch.channelId !== activeChannel.channelId) {
									return ch;
								}
								return { ...ch, messages: [...(ch.messages ?? []), msg] };
							}),
						};
					})
				);
			} finally {
				setIsSending(false);
			}
		},
		[api, activeServer?.guildId, activeChannel?.channelId]
	);

	if (isBooting) {
		return (
			<section className="w-full flex items-center justify-center p-6">
				<div className="rounded-3xl border bg-white shadow-sm p-6 text-sm text-slate-700">Ładowanie danych z backendu…</div>
			</section>
		);
	}

	if (bootError) {
		return (
			<section className="w-full flex items-center justify-center p-6">
				<div className="max-w-xl w-full rounded-3xl border bg-white shadow-sm p-6">
					<h2 className="text-lg font-semibold">Nie udało się odpalić drocsida</h2>
					<p className="text-sm text-slate-600 mt-2">{bootError}</p>
					<div className="mt-4 flex gap-3">
						<button type="button" className="px-4 py-2 rounded-xl bg-slate-900 text-white" onClick={() => window.location.reload()}>
							Reload
						</button>
						<button type="button" className="px-4 py-2 rounded-xl border" onClick={() => clearToken()}>
							Wyloguj
						</button>
					</div>
				</div>
			</section>
		);
	}

	const effectiveUser = currentUser ?? fallbackUser;

	if (!effectiveUser) {
		return (
			<section className="w-full flex items-center justify-center p-6">
				<div className="rounded-3xl border bg-white shadow-sm p-6 text-sm text-slate-700">Brak usera. Zaloguj się jeszcze raz.</div>
			</section>
		);
	}

	let mainContent: React.ReactNode;

	if (viewMode === "createServer") {
		mainContent = (
			<div className="h-full p-4" style={{ backgroundColor: theme.mainChat.background }}>
				<DrocsidCreateServer
					onCancel={() => setViewMode("chat")}
					onCreated={async (guildId) => {
						await reloadGuilds(guildId);
						setSideMode("servers");
						setActiveServerId(guildId);
						setViewMode("chat");
					}}
				/>
			</div>
		);
	} else if (viewMode === "userSettings") {
		mainContent = (
			<div className="h-full p-4" style={{ backgroundColor: theme.mainChat.background }}>
				<DrocsidUserSettings user={effectiveUser} onUserUpdated={(u) => setCurrentUser(u)} onClose={() => setViewMode("chat")} />
			</div>
		);
	} else if (viewMode === "serverSettings") {
		mainContent = (
			<div className="h-full p-4" style={{ backgroundColor: theme.mainChat.background }}>
				<DrocsidServerSettings
					server={activeServer}
					callerId={effectiveUser.id}
					initialChannelId={activeChannel?.channelId ?? null}
					onSaved={(nextServer) => {
						setServers((current) => replaceServer(current, nextServer));
					}}
				/>
			</div>
		);
	} else if (sideMode === "friends") {
		mainContent = <DrocsidChatView title="Prywatne wiadomości" messages={[]} isDm sendDisabledReason="Brak endpointów do DM w backendzie." />;
	} else {
		mainContent = <DrocsidChatView title={activeChannel ? activeChannel.name : "brak-kanału"} messages={serverMessages} isDm={false} onSendMessage={handleSendChannelMessage} isSending={isSending} />;
	}

	return (
		<section className="h-full w-full">
			<div
				className="h-full min-h-screen grid"
				style={{
					backgroundColor: theme.appBackground,
					gridTemplateColumns: `${DROCSID_LAYOUT.serversWidth} ${DROCSID_LAYOUT.channelsWidth} ${DROCSID_LAYOUT.mainWidth}`,
				}}>
				<DrocsidServersBar
					servers={servers}
					activeServerId={sideMode === "servers" ? activeServer?.guildId ?? null : null}
					sideMode={sideMode}
					onSelectSideMode={(mode) => {
						setSideMode(mode);
						setViewMode("chat");
					}}
					onSelectServer={(guildId) => {
						setSideMode("servers");
						setViewMode("chat");
						setActiveServerId(guildId);
					}}
					onOpenCreateServer={() => setViewMode("createServer")}
				/>

				<DrocsidChannelsBar
					mode={sideMode}
					server={sideMode === "servers" ? activeServer : null}
					channels={sideMode === "servers" ? channels : []}
					activeChannelId={sideMode === "servers" ? activeChannel?.channelId ?? null : null}
					onSelectChannel={(channelId) => {
						setSideMode("servers");
						setViewMode("chat");
						setActiveChannelId(channelId);
					}}
					friends={friends}
					activeFriendId={activeFriendId}
					onSelectFriend={() => null}
					onOpenServerSettings={() => setViewMode("serverSettings")}
					onOpenUserSettings={() => setViewMode("userSettings")}
					currentUser={effectiveUser}
				/>

				{mainContent}
			</div>
		</section>
	);
}
