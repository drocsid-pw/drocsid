import React, { useEffect, useMemo, useState } from "react";
import { useDrocsidTheme } from "../theme-provider";
import { buildInviteLink, copyToClipboard } from "../invites";
import type { DrocsidChannel } from "../types";

type DrocsidInvitePanelProps = {
	guildId: string;
	channels: DrocsidChannel[];
	preferredChannelId?: string | null;
};

function isTempChannelId(channelId: string): boolean {
	return channelId.startsWith("tmp-");
}

function pickDefaultChannelId(channels: DrocsidChannel[], preferredChannelId?: string | null): string | null {
	const preferred = (preferredChannelId ?? "").trim();
	if (preferred && !isTempChannelId(preferred) && channels.some((c) => c.channelId === preferred)) {
		return preferred;
	}

	const firstReal = channels.find((c) => c.channelId && !isTempChannelId(c.channelId));
	return firstReal?.channelId ?? null;
}

export function DrocsidInvitePanel(props: DrocsidInvitePanelProps) {
	const { guildId, channels, preferredChannelId } = props;

	const { isDark } = useDrocsidTheme();

	const ui = useMemo(() => {
		return {
			box: isDark ? "bg-white/5 border-[#212124] text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700",
			input: isDark ? "bg-[#222327] border-[#212124] text-slate-100" : "bg-white border-slate-200 text-slate-900",
			button: isDark ? "bg-slate-100 text-slate-900 hover:bg-white" : "bg-slate-900 text-white hover:bg-slate-800",
			buttonGhost: isDark ? "border-[#212124] text-slate-200 hover:bg-white/10" : "border-slate-200 text-slate-700 hover:bg-slate-50",
			muted: isDark ? "text-slate-400" : "text-slate-500",
		};
	}, [isDark]);

	const realChannels = useMemo(() => {
		return channels.filter((c) => c.channelId && !isTempChannelId(c.channelId));
	}, [channels]);

	const [channelId, setChannelId] = useState<string | null>(() => pickDefaultChannelId(realChannels, preferredChannelId));

	useEffect(() => {
		setChannelId((current) => {
			if (current && realChannels.some((c) => c.channelId === current)) {
				return current;
			}
			return pickDefaultChannelId(realChannels, preferredChannelId);
		});
	}, [realChannels, preferredChannelId]);

	const [inviteLink, setInviteLink] = useState<string>("");
	const [info, setInfo] = useState<string | null>(null);

	const link = inviteLink || buildInviteLink({ guildId, channelId });

	const handleGenerate = () => {
		setInfo(null);
		setInviteLink(buildInviteLink({ guildId, channelId }));
	};

	const handleCopy = async () => {
		setInfo(null);
		await copyToClipboard(link);
		setInfo("Skopiowane do schowka.");
	};

	const canPickChannel = realChannels.length > 0;

	return (
		<div className={`rounded-xl border p-4 ${ui.box}`}>
			<div className="flex items-start justify-between gap-4">
				<div>
					<div className="text-sm font-semibold">Invite link</div>
					<div className={`text-xs mt-1 ${ui.muted}`}>
                        Send someone the link. After entering, the app will add the user to the server and start the channel.
					</div>
				</div>

				<div className="flex gap-2">
					<button type="button" className={`px-3 py-2 text-sm rounded-lg transition ${ui.buttonGhost}`} onClick={() => setInviteLink("")}>
						Reset
					</button>
					<button type="button" className={`px-3 py-2 text-sm rounded-lg transition ${ui.button}`} onClick={handleGenerate}>
						Generate
					</button>
				</div>
			</div>

			<div className="mt-3 grid gap-2">
				{canPickChannel ? (
					<label className="grid gap-1 text-xs">
						<span className={ui.muted}>Channel</span>
						<select
							value={channelId ?? ""}
							onChange={(e) => setChannelId(e.target.value || null)}
							className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${ui.input}`}>
							{realChannels.map((c) => (
								<option key={c.channelId} value={c.channelId}>
									#{c.name}
								</option>
							))}
						</select>
					</label>
				) : (
					<div className={`text-xs ${ui.muted}`}>Brak zapisanych kanałów z realnym ID (tmp-* nie idą do invite linków).</div>
				)}

				<div className="flex gap-2">
					<input value={link} readOnly className={`flex-1 px-3 py-2 rounded-lg border text-sm ${ui.input}`} />
					<button type="button" className={`px-3 py-2 text-sm rounded-lg transition ${ui.buttonGhost}`} onClick={handleCopy}>
						Copy
					</button>
				</div>
			</div>

			{info && <div className={`text-xs mt-2 ${ui.muted}`}>{info}</div>}
		</div>
	);
}
