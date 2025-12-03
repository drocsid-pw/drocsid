import React, { useEffect, useMemo, useState } from "react";
import type { DrocsidChannel, DrocsidGuild, DrocsidFriend } from "../types";
import { currentUser, mockServers, mockFriends, mockFriendMessages } from "../data/mockData";
import { DrocsidServersBar } from "./DrocsidServersBar";
import { DrocsidChannelsBar } from "./DrocsidChannelsBar";
import { DrocsidChatView } from "./DrocsidChatView";
import { DrocsidUserSettings } from "./DrocsidUserSettings";
import { DrocsidServerSettings } from "./DrocsidServerSettings";
import { DROCSID_THEME } from "../theme";

type DrocsidViewMode = "chat" | "userSettings" | "serverSettings";
type DrocsidSideMode = "servers" | "friends";

const DROCSID_LAYOUT = {
	serversWidth: "6vw",
	channelsWidth: "20vw",
	mainWidth: "74vw",
};

/**
 * Główny widok drocsida:
 * - tryb serwerów (kanały tekstowe)
 * - tryb znajomych (prywatne wiadomości)
 * - settings usera i serwera
 */
export function DrocsidMainView() {
	const [viewMode, setViewMode] = useState<DrocsidViewMode>("chat");
	const [sideMode, setSideMode] = useState<DrocsidSideMode>("servers");

	const [activeServerId, setActiveServerId] = useState<bigint | null>(() => {
		return mockServers[0]?.id ?? null;
	});

	const [activeChannelId, setActiveChannelId] = useState<bigint | null>(() => {
		const firstServer = mockServers[0];
		if (!firstServer || firstServer.channels.length === 0) {
			return null;
		}
		return firstServer.channels[0].id;
	});

	const [activeFriendId, setActiveFriendId] = useState<bigint | null>(() => {
		return mockFriends[0]?.id ?? null;
	});

	const activeServer = useMemo<DrocsidGuild | null>(() => {
		if (!activeServerId) {
			return mockServers[0] ?? null;
		}
		const found = mockServers.find((server) => server.id === activeServerId);
		return found ?? mockServers[0] ?? null;
	}, [activeServerId]);

	const channels = useMemo<DrocsidChannel[]>(() => {
		if (!activeServer) {
			return [];
		}
		return activeServer.channels;
	}, [activeServer]);

	useEffect(() => {
		if (!activeServer) {
			return;
		}

		if (channels.length === 0) {
			setActiveChannelId(null);
			return;
		}

		const existsInServer = activeChannelId !== null && channels.some((channel) => channel.id === activeChannelId);

		if (!existsInServer) {
			setActiveChannelId(channels[0]?.id ?? null);
		}
	}, [activeServerId, activeServer, channels, activeChannelId]);

	const activeChannel = useMemo<DrocsidChannel | null>(() => {
		if (!activeServer || !activeChannelId) {
			return channels[0] ?? null;
		}
		const found = channels.find((channel) => channel.id === activeChannelId);
		return found ?? channels[0] ?? null;
	}, [activeServer, channels, activeChannelId]);

	const serverMessages = useMemo(() => {
		if (!activeChannel) {
			return [];
		}
		return activeChannel.messages ?? [];
	}, [activeChannel]);

	const activeFriend = useMemo<DrocsidFriend | null>(() => {
		if (!activeFriendId) {
			return mockFriends[0] ?? null;
		}
		const found = mockFriends.find((friend) => friend.id === activeFriendId);
		return found ?? mockFriends[0] ?? null;
	}, [activeFriendId]);

	const dmMessages = useMemo(() => {
		if (!activeFriend) {
			return [];
		}
		return mockFriendMessages[String(activeFriend.id)] ?? [];
	}, [activeFriend]);

	if (mockServers.length === 0) {
		return (
			<section className="rounded-3xl overflow-hidden border shadow-sm p-6">
				<p className="text-sm text-slate-600">Brak serwerów w mockowanych danych.</p>
			</section>
		);
	}

	let mainContent: React.ReactNode;

	if (viewMode === "userSettings") {
		mainContent = (
			<div className="h-full p-4" style={{ backgroundColor: DROCSID_THEME.mainChat.background }}>
				<DrocsidUserSettings />
			</div>
		);
	} else if (viewMode === "serverSettings") {
		mainContent = (
			<div className="h-full p-4" style={{ backgroundColor: DROCSID_THEME.mainChat.background }}>
				<DrocsidServerSettings />
			</div>
		);
	} else if (sideMode === "friends") {
		mainContent = <DrocsidChatView title={activeFriend ? activeFriend.name : "Znajomy"} messages={dmMessages} isDm />;
	} else {
		mainContent = <DrocsidChatView title={activeChannel ? activeChannel.name : "brak-kanału"} messages={serverMessages} isDm={false} />;
	}

	return (
		<section className="h-full w-full">
			<div
				className="h-full min-h-screen grid"
				style={{
					backgroundColor: DROCSID_THEME.appBackground,
					gridTemplateColumns: `${DROCSID_LAYOUT.serversWidth} ${DROCSID_LAYOUT.channelsWidth} ${DROCSID_LAYOUT.mainWidth}`,
				}}>
				<DrocsidServersBar
					servers={mockServers}
					activeServerId={sideMode === "servers" ? activeServer?.id ?? null : null}
					sideMode={sideMode}
					onSelectSideMode={(mode) => {
						setSideMode(mode);
						setViewMode("chat");
					}}
					onSelectServer={(serverId) => {
						setSideMode("servers");
						setViewMode("chat");
						setActiveServerId(serverId);
					}}
					onOpenServerSettings={() => setViewMode("serverSettings")}
				/>

				<DrocsidChannelsBar
					mode={sideMode}
					server={sideMode === "servers" ? activeServer : null}
					channels={sideMode === "servers" ? channels : []}
					activeChannelId={sideMode === "servers" ? activeChannel?.id ?? null : null}
					onSelectChannel={(channelId) => {
						setSideMode("servers");
						setViewMode("chat");
						setActiveChannelId(channelId);
					}}
					friends={mockFriends}
					activeFriendId={activeFriend?.id ?? null}
					onSelectFriend={(friendId) => {
						setSideMode("friends");
						setViewMode("chat");
						setActiveFriendId(friendId);
					}}
					onOpenServerSettings={() => setViewMode("serverSettings")}
					onOpenUserSettings={() => setViewMode("userSettings")}
					currentUser={currentUser}
				/>

				{mainContent}
			</div>
		</section>
	);
}
