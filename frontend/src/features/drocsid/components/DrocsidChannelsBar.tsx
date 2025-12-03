import React from "react";
import type { DrocsidChannel, DrocsidGuild, DrocsidFriend, DrocsidUser } from "../types";
import { DROCSID_THEME } from "../theme";

type DrocsidSideMode = "servers" | "friends";

type DrocsidChannelsBarProps = {
	mode: DrocsidSideMode;
	server: DrocsidGuild | null;
	channels: DrocsidChannel[];
	activeChannelId: bigint | null;
	onSelectChannel: (channelId: bigint) => void;
	friends: DrocsidFriend[];
	activeFriendId: bigint | null;
	onSelectFriend: (friendId: bigint) => void;
	onOpenServerSettings: () => void;
	onOpenUserSettings: () => void;
	currentUser: DrocsidUser;
};

/**
 * Lewy panel z kanałami dla serwera lub listą znajomych w trybie prywatnych wiadomości,
 * z overview użytkownika na dole.
 */
export function DrocsidChannelsBar(props: DrocsidChannelsBarProps) {
	const { mode, server, channels, activeChannelId, onSelectChannel, friends, activeFriendId, onSelectFriend, onOpenServerSettings, onOpenUserSettings, currentUser } = props;

	const headerTitle = mode === "servers" ? (server ? server.name : "Brak serwera") : "Prywatne wiadomości";

	return (
		<nav
			className="flex flex-col"
			style={{
				backgroundColor: DROCSID_THEME.channelsBar.background,
				color: DROCSID_THEME.channelsBar.text,
			}}>
			<div className="px-4 py-3 border-b flex items-center justify-between gap-2 font-semibold tracking-wide" style={{ borderColor: DROCSID_THEME.channelsBar.border }}>
				<span className="truncate" style={{ color: DROCSID_THEME.channelsBar.headline }}>
					{headerTitle}
				</span>
				{mode === "servers" && (
					<button type="button" className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20" title="Ustawienia serwera" onClick={onOpenServerSettings}>
						⚙
					</button>
				)}
			</div>

			<div className="p-3 space-y-1 overflow-auto">
				{mode === "servers" ? (
					<>
						<div className="text-xs uppercase px-2 py-1" style={{ color: DROCSID_THEME.channelsBar.sectionLabel }}>
							Kanały tekstowe
						</div>

						{channels.map((channel) => {
							const isActive = activeChannelId !== null && channel.id === activeChannelId;

							return (
								<button
									key={String(channel.id)}
									type="button"
									className={`w-full text-left px-3 py-2 rounded-lg transition ${isActive ? "bg-white/10 text-white" : "hover:bg-white/5"}`}
									title={`#${channel.name}`}
									onClick={() => onSelectChannel(channel.id)}>
									<span className="mr-1 text-slate-400">#</span>
									<span
										style={{
											color: isActive ? undefined : DROCSID_THEME.channelsBar.text,
										}}>
										{channel.name}
									</span>
								</button>
							);
						})}
					</>
				) : (
					<>
						<div className="text-xs uppercase px-2 py-1" style={{ color: DROCSID_THEME.channelsBar.sectionLabel }}>
							Znajomi
						</div>

						{friends.map((friend) => {
							const isActive = activeFriendId !== null && friend.id === activeFriendId;

							return (
								<button
									key={String(friend.id)}
									type="button"
									className={`w-full text-left px-2 py-2 rounded-lg transition ${isActive ? "bg-white/10 text-white" : "hover:bg-white/5"}`}
									onClick={() => onSelectFriend(friend.id)}
									title={friend.name}>
									<div className="flex items-center gap-3">
										<div className="relative">
											<div className="w-8 h-8 rounded-full grid place-items-center text-sm font-semibold" style={{ backgroundColor: DROCSID_THEME.accentSoft }}>
												{friend.avatarLetter}
											</div>
											<span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: "#22c55e" }} />
										</div>
										<div className="flex flex-col">
											<span
												className="text-sm"
												style={{
													color: isActive ? undefined : DROCSID_THEME.channelsBar.headline,
												}}>
												{friend.name}
											</span>
											<span className="text-xs text-slate-400">Prywatne wiadomości</span>
										</div>
									</div>
								</button>
							);
						})}
					</>
				)}
			</div>

			<div className="mt-auto px-3 py-3 border-t" style={{ borderColor: DROCSID_THEME.channelsBar.border }}>
				<button type="button" className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition" onClick={onOpenUserSettings} title="Ustawienia użytkownika">
					<div className="relative">
						<div className="w-8 h-8 rounded-full grid place-items-center text-sm font-semibold" style={{ backgroundColor: DROCSID_THEME.accentSoft }}>
							{currentUser.avatarLetter}
						</div>
						<span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: "#22c55e" }} />
					</div>

					<div className="flex-1 leading-tight">
						<div className="text-sm" style={{ color: DROCSID_THEME.channelsBar.headline }}>
							{currentUser.name}
						</div>
						<div className="text-xs text-slate-400">online</div>
					</div>

					<div className="text-slate-400 text-xs">⚙</div>
				</button>
			</div>
		</nav>
	);
}
