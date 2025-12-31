import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDrocsidApi } from "../../../api/useDrocsidApi";
import { isDrocsidApiError } from "../../../api/http";

type ParsedInvite = { guildId: string; channelId: string | null };

function getErrorText(err: unknown): string {
	if (isDrocsidApiError(err)) return `${err.code}: ${err.message}`;
	if (err instanceof Error) return err.message;
	return "Unknown error";
}

function parseInvite(input: string): ParsedInvite | null {
	const raw = input.trim();
	if (!raw) return null;

	// full url or relative url with query params
	try {
		const url = raw.startsWith("http://") || raw.startsWith("https://") ? new URL(raw) : new URL(raw, window.location.origin);
		const guildId = url.searchParams.get("guildId");
		const channelId = url.searchParams.get("channelId");
		if (guildId) return { guildId, channelId: channelId || null };
	} catch {}

	// format: guildId:channelId
	if (raw.includes(":")) {
		const [g, c] = raw.split(":").map((x) => x.trim());
		if (g) return { guildId: g, channelId: c || null };
	}

	// fallback: just guildId
	return { guildId: raw, channelId: null };
}

export function ServerInviteSection(props: { onJoined?: () => void }) {
	const { onJoined } = props;

	const api = useDrocsidApi();
	const navigate = useNavigate();

	const [value, setValue] = useState("");
	const [isJoining, setIsJoining] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const parsed = useMemo(() => parseInvite(value), [value]);
	const canJoin = !!api && !!parsed && !isJoining;

	const handleJoin = async () => {
		setError(null);

		if (!api) {
			setError("Missing API (auth). Please sign in again.");
			return;
		}
		if (!parsed) {
			setError("Paste a valid invite (URL, guildId, or guildId:channelId).");
			return;
		}

		setIsJoining(true);
		try {
			await api.addUserToGuild(parsed.guildId);

			const qs = new URLSearchParams();
			qs.set("guildId", parsed.guildId);
			if (parsed.channelId) qs.set("channelId", parsed.channelId);

			navigate(`/app?${qs.toString()}`);
			onJoined?.();
		} catch (e) {
			setError(getErrorText(e));
		} finally {
			setIsJoining(false);
		}
	};

	return (
		<section className="rounded-2xl border p-4">
			<h3 className="text-sm font-semibold">Join server</h3>
			<p className="text-xs text-slate-500 mt-1">Wklej invite link albo samo guildId (ew. guildId:channelId).</p>

			{error && <div className="text-xs text-red-600 mt-3">{error}</div>}

			<div className="mt-3 flex gap-2">
				<input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="https://.../app?guildId=...&channelId=..."
					className="flex-1 px-3 py-2 rounded-lg border text-sm"
				/>
				<button
					type="button"
					onClick={handleJoin}
					disabled={!canJoin}
					className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60">
					{isJoining ? "Joining..." : "Join"}
				</button>
			</div>

			{parsed && (
				<div className="mt-2 text-[11px] text-slate-500">
					Parsed: guildId=<span className="font-medium">{parsed.guildId}</span>
					{parsed.channelId ? (
						<>
							{" "}
							channelId=<span className="font-medium">{parsed.channelId}</span>
						</>
					) : null}
				</div>
			)}
		</section>
	);
}
