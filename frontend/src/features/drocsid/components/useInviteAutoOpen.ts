import { useEffect, useMemo, useRef } from "react";
import { clearInviteFromUrl, readInviteFromLocation } from "../invites";

type UseInviteAutoOpenArgs = {
	guildsLoaded: boolean;
	channelsLoaded: boolean;
	channels: Array<{ id: string }>;
	reloadGuilds: (guildId: string) => Promise<void>;
	setActiveChannelId: (channelId: string) => void;
	onOpenServersMode: () => void;
	joinGuildById: (guildId: string) => Promise<void>;
};

export function useInviteAutoOpen(args: UseInviteAutoOpenArgs) {
	/**
	 * Reads ?invite & ?channel from URL and tries to:
	 * - open servers mode
	 * - join the guild (best-effort)
	 * - reload guild list and select the guild
	 * - select the requested channel when available
	 * - clear invite params from URL to avoid repeated joins
	 *
	 * Current contract: invite value is treated as guildId.
	 */
	const initial = useMemo(() => readInviteFromLocation(), []);
	const inviteRef = useRef(initial);
	const processedRef = useRef(false);
	const targetChannelRef = useRef<string | null>((initial.channelId ?? "").trim() || null);

	useEffect(() => {
		const { invite } = inviteRef.current;

		if (processedRef.current) return;
		if (!invite) return;
		if (!args.guildsLoaded) return;

		processedRef.current = true;

		void (async () => {
			try {
				args.onOpenServersMode();

				const guildId = invite.trim();
				if (!guildId) return;

				try {
					await args.joinGuildById(guildId);
				} catch {}

				await args.reloadGuilds(guildId);
			} finally {
				clearInviteFromUrl();
			}
		})();
	}, [
		args.guildsLoaded,
		args.joinGuildById,
		args.onOpenServersMode,
		args.reloadGuilds,
	]);

	useEffect(() => {
		const desired = targetChannelRef.current;
		if (!desired) return;
		if (!args.channelsLoaded) return;

		const exists = args.channels.some((c) => c.id === desired);
		if (!exists) return;

		args.setActiveChannelId(desired);
		targetChannelRef.current = null;
	}, [args.channelsLoaded, args.channels, args.setActiveChannelId]);
}
