import React, { useMemo } from "react";
import type { DrocsidChannel, DrocsidFriend, DrocsidGuild, DrocsidUser } from "../types";
import { useDrocsidTheme } from "../theme-provider";

type DrocsidSideMode = "servers" | "friends";

type DrocsidChannelsBarProps = {
	mode: DrocsidSideMode;
	server: DrocsidGuild | null;
	channels: DrocsidChannel[];
	activeChannelId: string | null;
	onSelectChannel: (channelId: string) => void;

	friends: DrocsidFriend[];
	activeFriendId: string | null;
	onSelectFriend: (friendId: string) => void;

	onOpenServerSettings: () => void;
	onOpenUserSettings: () => void;
	currentUser: DrocsidUser;
};

type SidebarButtonProps = {
	isActive: boolean;
	onClick: () => void;
	title: string;
	children: React.ReactNode;
};

function SidebarButton(props: SidebarButtonProps) {
	const { isActive, onClick, title, children } = props;

	return (
		<button
			type="button"
			className={[
				"w-full text-left rounded-lg transition",
				"focus:outline-none focus:ring-2 focus:ring-slate-300/40",
				isActive ? "bg-white/10 text-white" : "hover:bg-white/5",
			].join(" ")}
			onClick={onClick}
			title={title}>
			{children}
		</button>
	);
}

type AvatarChipProps = {
	letter: string;
	accentSoft: string;
	showOnlineBadge?: boolean;
};

function AvatarChip(props: AvatarChipProps) {
	const { letter, accentSoft, showOnlineBadge } = props;

	return (
		<div className="relative shrink-0">
			<div className="w-8 h-8 rounded-full grid place-items-center text-sm font-semibold" style={{ backgroundColor: accentSoft }}>
				{letter}
			</div>

			{showOnlineBadge && (
				<span
					className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border border-slate-900"
					style={{ backgroundColor: "#22c55e" }}
				/>
			)}
		</div>
	);
}

type SectionLabelProps = {
	text: string;
	color: string;
};

function SectionLabel(props: SectionLabelProps) {
	const { text, color } = props;
	return (
		<div className="text-xs uppercase px-2 py-1" style={{ color }}>
			{text}
		</div>
	);
}

type ChannelRowProps = {
	channel: DrocsidChannel;
	isActive: boolean;
	onClick: () => void;
	inactiveTextColor: string;
};

function ChannelRow(props: ChannelRowProps) {
	const { channel, isActive, onClick, inactiveTextColor } = props;

	return (
		<SidebarButton isActive={isActive} onClick={onClick} title={`#${channel.name}`}>
			<div className="px-3 py-2">
				<span className="mr-1 text-slate-400">#</span>
				<span style={{ color: isActive ? undefined : inactiveTextColor }}>{channel.name}</span>
			</div>
		</SidebarButton>
	);
}

type FriendRowProps = {
	friend: DrocsidFriend;
	isActive: boolean;
	onClick: () => void;
	accentSoft: string;
	headlineColor: string;
};

function FriendRow(props: FriendRowProps) {
	const { friend, isActive, onClick, accentSoft, headlineColor } = props;

	return (
		<SidebarButton isActive={isActive} onClick={onClick} title={friend.name}>
			<div className="px-2 py-2 flex items-center gap-3">
				<AvatarChip letter={friend.avatarLetter} accentSoft={accentSoft} showOnlineBadge />

				<div className="min-w-0 flex flex-col">
					<span className="text-sm truncate" style={{ color: isActive ? undefined : headlineColor }}>
						{friend.name}
					</span>
					<span className="text-xs text-slate-400">Direct messages</span>
				</div>
			</div>
		</SidebarButton>
	);
}

type HeaderProps = {
	title: string;
	borderColor: string;
	headlineColor: string;
	showServerSettings: boolean;
	onOpenServerSettings: () => void;
};

function Header(props: HeaderProps) {
	const { title, borderColor, headlineColor, showServerSettings, onOpenServerSettings } = props;

	return (
		<div className="px-4 py-3 border-b flex items-center justify-between gap-2 font-semibold tracking-wide" style={{ borderColor }}>
			<span className="truncate" style={{ color: headlineColor }}>
				{title}
			</span>

			{showServerSettings && (
				<button
					type="button"
					className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition"
					title="Server settings"
					onClick={onOpenServerSettings}>
					⚙
				</button>
			)}
		</div>
	);
}

type ChannelsSectionProps = {
	channels: DrocsidChannel[];
	activeChannelId: string | null;
	onSelectChannel: (channelId: string) => void;
	sectionLabelColor: string;
	textColor: string;
};

function ChannelsSection(props: ChannelsSectionProps) {
	const { channels, activeChannelId, onSelectChannel, sectionLabelColor, textColor } = props;

	return (
		<>
			<SectionLabel text="Text channels" color={sectionLabelColor} />

			{channels.map((channel) => {
				const isActive = activeChannelId !== null && channel.channelId === activeChannelId;

				return (
					<ChannelRow
						key={channel.channelId}
						channel={channel}
						isActive={isActive}
						onClick={() => onSelectChannel(channel.channelId)}
						inactiveTextColor={textColor}
					/>
				);
			})}
		</>
	);
}

type FriendsSectionProps = {
	friends: DrocsidFriend[];
	activeFriendId: string | null;
	onSelectFriend: (friendId: string) => void;
	sectionLabelColor: string;
	accentSoft: string;
	headlineColor: string;
};

function FriendsSection(props: FriendsSectionProps) {
	const { friends, activeFriendId, onSelectFriend, sectionLabelColor, accentSoft, headlineColor } = props;

	return (
		<>
			<SectionLabel text="Friends" color={sectionLabelColor} />

			{friends.map((friend) => {
				const isActive = activeFriendId !== null && friend.id === activeFriendId;

				return (
					<FriendRow
						key={friend.id}
						friend={friend}
						isActive={isActive}
						onClick={() => onSelectFriend(friend.id)}
						accentSoft={accentSoft}
						headlineColor={headlineColor}
					/>
				);
			})}
		</>
	);
}

type UserFooterProps = {
	currentUser: DrocsidUser;
	onOpenUserSettings: () => void;
	borderColor: string;
	accentSoft: string;
	headlineColor: string;
};

function UserFooter(props: UserFooterProps) {
	const { currentUser, onOpenUserSettings, borderColor, accentSoft, headlineColor } = props;

	return (
		<div className="mt-auto px-3 py-3 border-t" style={{ borderColor }}>
			<button
				type="button"
				className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-slate-300/40"
				onClick={onOpenUserSettings}
				title="User settings">
				<AvatarChip letter={currentUser.avatarLetter} accentSoft={accentSoft} showOnlineBadge />

				<div className="flex-1 leading-tight min-w-0">
					<div className="text-sm truncate" style={{ color: headlineColor }}>
						{currentUser.name}
					</div>
					<div className="text-xs text-slate-400">Online</div>
				</div>

				<div className="text-slate-400 text-xs">⚙</div>
			</button>
		</div>
	);
}

export function DrocsidChannelsBar(props: DrocsidChannelsBarProps) {
	/**
	 * Left-side navigation for channels/friends.
	 * Keeps logic unchanged, aligns UI language and avatar presentation with production settings panel.
	 */
	const {
		mode,
		server,
		channels,
		activeChannelId,
		onSelectChannel,
		friends,
		activeFriendId,
		onSelectFriend,
		onOpenServerSettings,
		onOpenUserSettings,
		currentUser,
	} = props;

	const { theme } = useDrocsidTheme();

	const headerTitle = useMemo(() => {
		if (mode === "friends") {
			return "Direct messages";
		}
		return server ? server.name : "No server selected";
	}, [mode, server]);

	const showServerSettings = mode === "servers" && server !== null;

	return (
		<nav
			className="flex flex-col"
			style={{
				backgroundColor: theme.channelsBar.background,
				color: theme.channelsBar.text,
			}}>
			<Header
				title={headerTitle}
				borderColor={theme.channelsBar.border}
				headlineColor={theme.channelsBar.headline}
				showServerSettings={showServerSettings}
				onOpenServerSettings={onOpenServerSettings}
			/>

			<div className="p-3 space-y-1 overflow-auto">
				{mode === "servers" ? (
					<ChannelsSection
						channels={channels}
						activeChannelId={activeChannelId}
						onSelectChannel={onSelectChannel}
						sectionLabelColor={theme.channelsBar.sectionLabel}
						textColor={theme.channelsBar.text}
					/>
				) : (
					<FriendsSection
						friends={friends}
						activeFriendId={activeFriendId}
						onSelectFriend={onSelectFriend}
						sectionLabelColor={theme.channelsBar.sectionLabel}
						accentSoft={theme.accentSoft}
						headlineColor={theme.channelsBar.headline}
					/>
				)}
			</div>

			<UserFooter
				currentUser={currentUser}
				onOpenUserSettings={onOpenUserSettings}
				borderColor={theme.channelsBar.border}
				accentSoft={theme.accentSoft}
				headlineColor={theme.channelsBar.headline}
			/>
		</nav>
	);
}
