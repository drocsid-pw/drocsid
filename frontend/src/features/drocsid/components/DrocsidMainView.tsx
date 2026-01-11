import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useInviteAutoOpen } from "./useInviteAutoOpen";

type DrocsidViewMode = "chat" | "userSettings" | "serverSettings" | "createServer";
type DrocsidSideMode = "servers" | "friends";

const DROCSID_LAYOUT = {
	serversWidth: "6vw",
	channelsWidth: "20vw",
	mainWidth: "74vw",
};

const EMPTY_FRIENDS: DrocsidFriend[] = [];

function replaceServer(servers: DrocsidGuild[], next: DrocsidGuild) {
	return servers.map((s) => (s.guildId === next.guildId ? next : s));
}

function dedupeById<T>(items: T[], getId: (item: T) => string): T[] {
	const byId = new Map<string, T>();
	for (const item of items) {
		byId.set(getId(item), item);
	}
	return [...byId.values()];
}

function findByIdOrFirst<T>(items: T[], id: string | null, getId: (item: T) => string): T | null {
	if (items.length === 0) {
		return null;
	}
	if (!id) {
		return items[0] ?? null;
	}
	return items.find((x) => getId(x) === id) ?? items[0] ?? null;
}

function ensureSelectedId(items: { id: string }[], currentId: string | null): string | null {
	if (items.length === 0) {
		return null;
	}
	if (currentId && items.some((x) => x.id === currentId)) {
		return currentId;
	}
	return items[0]?.id ?? null;
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

type CancelableJob = (args: { isCancelled: () => boolean }) => Promise<void>;

function runCancelableEffect(job: CancelableJob) {
	let cancelled = false;

	void job({
		isCancelled: () => cancelled,
	});

	return () => {
		cancelled = true;
	};
}

async function fileToBase64(file: File): Promise<string> {
	const dataUrl = await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Nie udało się odczytać pliku"));
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.readAsDataURL(file);
	});

	const idx = dataUrl.indexOf("base64,");
	if (idx < 0) {
		throw new Error("Nie udało się zrobić base64 z pliku");
	}

	return dataUrl.slice(idx + "base64,".length);
}

function buildImageMessageContent(url: string): string {
	const safe = (url ?? "").trim();
	return `<img src="${safe}">`;
}

export function DrocsidMainView() {
	const { theme } = useDrocsidTheme();
	const api = useDrocsidApi();
	const { callerId, payload, clearToken } = useAuth();
	const messagesPollInFlightRef = useRef(false);
	const messagesLoadedOnceRef = useRef(false);

	const [bootError, setBootError] = useState<string | null>(null);
	const [isBooting, setIsBooting] = useState(true);

	const [currentUser, setCurrentUser] = useState<DrocsidUser | null>(null);

	const [servers, setServers] = useState<DrocsidGuild[]>([]);
	const [viewMode, setViewMode] = useState<DrocsidViewMode>("chat");
	const [sideMode, setSideMode] = useState<DrocsidSideMode>("servers");

	const [activeServerId, setActiveServerId] = useState<string | null>(null);
	const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

	const [isSending, setIsSending] = useState(false);

	const [hydratedGuildIds, setHydratedGuildIds] = useState<Set<string>>(() => new Set());

	const friends = EMPTY_FRIENDS;
	const activeFriendId: string | null = null;

	useEffect(() => {
		document.body.classList.add("drocsid-lock");
		return () => {
			document.body.classList.remove("drocsid-lock");
		};
	}, []);

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

		const dto = await api.getCurrentUser();
		return mapUserDto(dto, { id: callerId, name: payload?.name ?? undefined });
	}, [api, callerId, payload?.name]);

	const reloadGuilds = useCallback(
		async (selectGuildId?: string | null) => {
			if (!api || !callerId) {
				return;
			}

			const list = await api.getAllGuilds(callerId);
			const guilds = dedupeById((list.guilds ?? []).map(mapGuildDto), (g) => g.guildId);

			setServers((prev) => mergeGuildSummaries(prev, guilds));

			const preferredId = selectGuildId ?? activeServerId;
			const nextId = guilds.some((g) => g.guildId === preferredId) ? preferredId ?? null : guilds[0]?.guildId ?? null;
			setActiveServerId(nextId);
		},
		[api, callerId, activeServerId]
	);

	useEffect(() => {
		if (!api || !callerId) {
			setIsBooting(false);
			setBootError("Brak tokenu lub callerId. Zaloguj się ponownie.");
			return;
		}

		return runCancelableEffect(async ({ isCancelled }) => {
			try {
				setIsBooting(true);
				setBootError(null);

				const [user] = await Promise.all([ensureUser(), reloadGuilds(null)]);

				if (isCancelled()) {
					return;
				}

				setCurrentUser(user ?? fallbackUser);
			} catch (e) {
				if (isCancelled()) {
					return;
				}
				setBootError(getErrorText(e));
			} finally {
				if (!isCancelled()) {
					setIsBooting(false);
				}
			}
		});
	}, [api, callerId, ensureUser, reloadGuilds, fallbackUser]);

	const activeServer = useMemo(() => {
		return findByIdOrFirst(servers, activeServerId, (s) => s.guildId);
	}, [servers, activeServerId]);

	const channels = useMemo<DrocsidChannel[]>(() => activeServer?.channels ?? [], [activeServer?.channels]);

	useEffect(() => {
		const items = channels.map((c) => ({ id: c.channelId }));
		const nextId = ensureSelectedId(items, activeChannelId);
		setActiveChannelId(nextId);
	}, [activeServer?.guildId, channels, activeChannelId]);

	const activeChannel = useMemo(() => {
		return findByIdOrFirst(channels, activeChannelId, (c) => c.channelId);
	}, [channels, activeChannelId]);

	useEffect(() => {
		if (!api || !activeServer?.guildId) {
			return;
		}

		return runCancelableEffect(async ({ isCancelled }) => {
			const guildId = activeServer.guildId;

			try {
				const [guildDto, rolesDto, channelsDto, usersDto] = await Promise.all([api.getGuild(guildId), api.getRoles(guildId), api.getAllChannels(guildId), api.getGuildUsers(guildId)]);

				if (isCancelled()) {
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

				setHydratedGuildIds((prev) => {
					const next = new Set(prev);
					next.add(guildId);
					return next;
				});
			} catch (e) {
				if (isCancelled()) {
					return;
				}
				setBootError(getErrorText(e));
			}
		});
	}, [api, activeServer?.guildId]);

	useEffect(() => {
		if (!api || !activeChannelId || !activeServer?.guildId) {
			return;
		}

		let cancelled = false;

		const guildId = activeServer.guildId;
		const channelId = activeChannelId;

		messagesLoadedOnceRef.current = false;

		const load = async () => {
			if (cancelled) return;

			if (document.visibilityState === "hidden") {
				return;
			}

			if (messagesPollInFlightRef.current) {
				return;
			}

			messagesPollInFlightRef.current = true;

			try {
				const list = await api.getMessages(channelId, 0, 50);

				if (cancelled) return;

				const mapped = (list.messages ?? []).map((m) => mapMessageDto(m)).reverse();

				setServers((prev) =>
					prev.map((g) => {
						if (g.guildId !== guildId) {
							return g;
						}

						return {
							...g,
							channels: (g.channels ?? []).map((ch) => (ch.channelId === channelId ? { ...ch, messages: mapped } : ch)),
						};
					})
				);

				messagesLoadedOnceRef.current = true;
			} catch (e) {
				if (cancelled) return;

				if (!messagesLoadedOnceRef.current) {
					setBootError(getErrorText(e));
				}
			} finally {
				messagesPollInFlightRef.current = false;
			}
		};

		void load();

		const intervalId = window.setInterval(() => {
			void load();
		}, 5000);

		return () => {
			cancelled = true;
			window.clearInterval(intervalId);
		};
	}, [api, activeChannelId, activeServer?.guildId]);

	const serverMessages = useMemo(() => activeChannel?.messages ?? [], [activeChannel?.messages]);

	const activeGuildId = activeServer?.guildId ?? null;
	const activeChId = activeChannel?.channelId ?? null;

	const handleSendChannelMessage = useCallback(
		async (content: string) => {
			if (!api) {
				return;
			}

			if (!activeGuildId || !activeChId) {
				return;
			}

			const trimmed = content.trim();
			if (!trimmed) {
				return;
			}

			setIsSending(true);

			try {
				const dto = await api.createMessage(activeChId, trimmed);
				const msg = mapMessageDto(dto, { timestamp: dto.timestamp ?? new Date().toISOString() });

				setServers((prev) =>
					prev.map((g) => {
						if (g.guildId !== activeGuildId) {
							return g;
						}

						return {
							...g,
							channels: g.channels.map((ch) => {
								if (ch.channelId !== activeChId) {
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
		[api, activeGuildId, activeChId]
	);

	const handleSendChannelImage = useCallback(
		async (file: File) => {
			if (!api) return;
			if (!activeGuildId || !activeChId) return;

			if (!file.type.startsWith("image/")) {
				throw new Error("To nie jest obrazek");
			}

			setIsSending(true);

			try {
				const base64 = await fileToBase64(file);

				const uploaded = await api.uploadImage(base64, file.name || "image.png");
				const url = (uploaded?.url ?? "").trim();

				if (!url) {
					throw new Error("Upload nie zwrócił url");
				}

				const content = buildImageMessageContent(url);
				const dto = await api.createMessage(activeChId, content);
				const msg = mapMessageDto(dto, { timestamp: dto.timestamp ?? new Date().toISOString() });

				setServers((prev) =>
					prev.map((g) => {
						if (g.guildId !== activeGuildId) {
							return g;
						}

						return {
							...g,
							channels: g.channels.map((ch) => {
								if (ch.channelId !== activeChId) {
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
		[api, activeGuildId, activeChId]
	);

	const guildsLoaded = !isBooting && !bootError;
	const channelsLoaded = !!activeServer?.guildId && hydratedGuildIds.has(activeServer.guildId);

	useInviteAutoOpen({
		guildsLoaded,
		channelsLoaded,
		channels: channels.map((c) => ({ id: c.channelId })),
		reloadGuilds: async (guildId) => {
			await reloadGuilds(guildId);
		},
		setActiveChannelId: (channelId) => {
			setActiveChannelId(channelId);
		},
		onOpenServersMode: () => {
			setSideMode("servers");
			setViewMode("chat");
		},
		joinGuildById: async (guildId) => {
			if (!api) return;

			await api.addUserToGuild(guildId);
			await reloadGuilds(guildId);

			setSideMode("servers");
			setViewMode("chat");
		},
	});

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
			<div className="h-full min-h-0 overflow-y-auto p-4" style={{ backgroundColor: theme.mainChat.background }}>
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
			<div className="h-full min-h-0 overflow-y-auto p-4" style={{ backgroundColor: theme.mainChat.background }}>
				<DrocsidUserSettings user={effectiveUser} onUserUpdated={(u) => setCurrentUser(u)} onClose={() => setViewMode("chat")} />
			</div>
		);
	} else if (viewMode === "serverSettings") {
		mainContent = (
			<div className="h-full min-h-0 overflow-y-auto p-4" style={{ backgroundColor: theme.mainChat.background }}>
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
		mainContent = <DrocsidChatView title={activeChannel ? activeChannel.name : "brak-kanału"} messages={serverMessages} isDm={false} onSendMessage={handleSendChannelMessage} onSendImage={handleSendChannelImage} isSending={isSending} />;
	}

	return (
		<section className="h-[100dvh] w-full overflow-hidden">
			<div
				className="h-full min-h-0 grid"
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

				<div className="h-full min-h-0 overflow-hidden">{mainContent}</div>
			</div>
		</section>
	);
}
