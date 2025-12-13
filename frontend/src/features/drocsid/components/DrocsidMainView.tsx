import React, { useEffect, useMemo, useState } from "react";
import type { DrocsidChannel, DrocsidGuild, DrocsidFriend } from "../types";
import { currentUser, mockServers, mockFriends, mockFriendMessages } from "../data/mockData";
import { DrocsidServersBar } from "./DrocsidServersBar";
import { DrocsidChannelsBar } from "./DrocsidChannelsBar";
import { DrocsidChatView } from "./DrocsidChatView";
import { DrocsidUserSettings } from "./DrocsidUserSettings";
import { DrocsidServerSettings } from "./DrocsidServerSettings";
import { DrocsidCreateServer } from "./DrocsidCreateServer";
import { useDrocsidTheme } from "../theme-provider";

type DrocsidViewMode = "chat" | "userSettings" | "serverSettings" | "createServer";
type DrocsidSideMode = "servers" | "friends";

const DROCSID_LAYOUT = {
	serversWidth: "6vw",
	channelsWidth: "20vw",
	mainWidth: "74vw",
};

function replaceServer(servers: DrocsidServer[], next: DrocsidServer) {
	return servers.map((s) => (s.id === next.id ? next : s));
}

export function DrocsidMainView() {
	const { theme } = useDrocsidTheme();

	const callerId = currentUser.id;

	const [servers, setServers] = useState<DrocsidServer[]>(() => mockServers);

	const [viewMode, setViewMode] = useState<DrocsidViewMode>("chat");
	const [sideMode, setSideMode] = useState<DrocsidSideMode>("servers");

	const [activeServerId, setActiveServerId] = useState<string | null>(() => servers[0]?.id ?? null);

	const [activeChannelId, setActiveChannelId] = useState<string | null>(() => {
		const firstServer = servers[0];
		if (!firstServer || firstServer.channels.length === 0) {
			return null;
		}
		return firstServer.channels[0].id;
	});

	const [activeFriendId, setActiveFriendId] = useState<string | null>(() => mockFriends[0]?.id ?? null);

	const activeServer = useMemo<DrocsidServer | null>(() => {
		if (servers.length === 0) {
			return null;
		}
		if (!activeServerId) {
			return servers[0] ?? null;
		}
		const found = servers.find((server) => server.id === activeServerId);
		return found ?? servers[0] ?? null;
	}, [servers, activeServerId]);

	const channels = useMemo<DrocsidChannel[]>(() => activeServer?.channels ?? [], [activeServer]);

	useEffect(() => {
		if (!activeServer) {
			return;
		}

		if (channels.length === 0) {
			setActiveChannelId(null);
			return;
		}

		const existsInServer = channels.some((channel) => channel.id === activeChannelId);
		if (!existsInServer) {
			setActiveChannelId(channels[0]?.id ?? null);
		}
	}, [activeServerId, activeServer, channels, activeChannelId]);

	const activeChannel = useMemo<DrocsidChannel | null>(() => {
		if (!activeServer || channels.length === 0) {
			return null;
		}
		if (!activeChannelId) {
			return channels[0] ?? null;
		}
		const found = channels.find((channel) => channel.id === activeChannelId);
		return found ?? channels[0] ?? null;
	}, [activeServer, channels, activeChannelId]);

	const serverMessages = useMemo(() => activeChannel?.messages ?? [], [activeChannel]);

	const activeFriend = useMemo<DrocsidFriend | null>(() => {
		if (!activeFriendId) {
			return mockFriends[0] ?? null;
		}
		const found = mockFriends.find((friend) => friend.id === activeFriendId);
		return found ?? mockFriends[0] ?? null;
	}, [activeFriendId]);

	const dmMessages = useMemo(() => (activeFriend ? mockFriendMessages[activeFriend.id] ?? [] : []), [activeFriend]);

	if (servers.length === 0) {
		return (
			<section className="rounded-3xl overflow-hidden border shadow-sm p-6">
				<p className="text-sm text-slate-600">Brak serwerów w mockowanych danych.</p>
			</section>
		);
	}

	let mainContent: React.ReactNode;

	if (viewMode === "createServer") {
		mainContent = (
			<div className="h-full p-4" style={{ backgroundColor: theme.mainChat.background }}>
				<DrocsidCreateServer
					callerId={callerId}
					onCancel={() => setViewMode("chat")}
					onCreated={(server) => {
						setServers((current) => [...current, server]);
						setSideMode("servers");
						setActiveServerId(server.id);
						setActiveChannelId(server.channels[0]?.id ?? null);
						setViewMode("chat");
					}}
				/>
			</div>
		);
	} else if (viewMode === "userSettings") {
		mainContent = (
			<div className="h-full p-4" style={{ backgroundColor: theme.mainChat.background }}>
				<DrocsidUserSettings />
			</div>
		);
	} else if (viewMode === "serverSettings") {
		mainContent = (
			<div className="h-full p-4" style={{ backgroundColor: theme.mainChat.background }}>
				<DrocsidServerSettings
					server={activeServer}
					callerId={callerId}
					initialChannelId={activeChannel?.id ?? null}
					onSaved={(nextServer) => {
						setServers((current) => replaceServer(current, nextServer));
					}}
				/>
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
					backgroundColor: theme.appBackground,
					gridTemplateColumns: `${DROCSID_LAYOUT.serversWidth} ${DROCSID_LAYOUT.channelsWidth} ${DROCSID_LAYOUT.mainWidth}`,
				}}>
				<DrocsidServersBar
					servers={servers}
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
					onOpenCreateServer={() => setViewMode("createServer")}
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
