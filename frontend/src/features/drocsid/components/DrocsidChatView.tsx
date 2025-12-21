import React, { useMemo, useState } from "react";
import type { DrocsidMessage } from "../types";
import { useDrocsidTheme } from "../theme-provider";

type DrocsidChatViewProps = {
	title: string;
	messages: DrocsidMessage[];
	isDm: boolean;
	onSendMessage?: (content: string) => Promise<void> | void;
	sendDisabledReason?: string;
	isSending?: boolean;
};

export function DrocsidChatView(props: DrocsidChatViewProps) {
	const { title, messages, isDm, onSendMessage, sendDisabledReason, isSending } = props;

	const { theme } = useDrocsidTheme();

	const [draft, setDraft] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const displayTitle = title || (isDm ? "Prywatne wiadomości" : "brak-kanału");
	const inputTargetLabel = isDm ? displayTitle : `#${displayTitle}`;

	const canSend = !!onSendMessage && !isSending && !sendDisabledReason;

	const info = useMemo(() => {
		if (sendDisabledReason) {
			return sendDisabledReason;
		}
		if (isDm && !onSendMessage) {
			return "DM-y nie są jeszcze podpięte w backendzie.";
		}
		return null;
	}, [sendDisabledReason, isDm, onSendMessage]);

	return (
		<main className="grid grid-rows-[auto_1fr_auto]" style={{ backgroundColor: theme.mainChat.background }}>
			<div
				className="h-12 px-4 border-b flex items-center gap-3"
				style={{
					backgroundColor: theme.mainChat.headerBackground,
					borderColor: theme.mainChat.border,
				}}>
				<div className="text-slate-400">{isDm ? <span className="inline-block w-6 h-6 rounded-full bg-slate-300 grid place-items-center text-xs">🙂</span> : "#"}</div>
				<div className="font-medium" style={{ color: theme.mainChat.headline }}>
					{displayTitle}
				</div>
			</div>

			<div className="overflow-auto p-4 space-y-4">
				{messages.map((message) => (
					<div key={message.messageId} className="flex gap-3">
						<div className="w-10 h-10 rounded-full bg-slate-300 grid place-items-center">👤</div>
						<div className="flex-1">
							<div className="flex items-baseline gap-2">
								<span className="font-semibold" style={{ color: theme.mainChat.headline }}>
									{message.author.nick}
								</span>
								<span className="text-xs text-slate-500">{message.timestamp || ""}</span>
							</div>
							<div style={{ color: theme.mainChat.text }}>{message.content}</div>
						</div>
					</div>
				))}

				{messages.length === 0 && (
					<div className="text-sm" style={{ color: theme.mainChat.text }}>
						Brak wiadomości.
					</div>
				)}
			</div>

			<form
				className="p-4 border-t"
				style={{
					backgroundColor: theme.mainChat.headerBackground,
					borderColor: theme.mainChat.border,
				}}
				onSubmit={async (event) => {
					event.preventDefault();
					setLocalError(null);

					if (!onSendMessage) {
						return;
					}

					const content = draft.trim();
					if (!content) {
						return;
					}

					try {
						await onSendMessage(content);
						setDraft("");
					} catch (e) {
						const msg = e instanceof Error ? e.message : "Nie udało się wysłać wiadomości";
						setLocalError(msg);
					}
				}}>
				<div className="flex flex-col gap-2">
					{info && <div className="text-xs text-slate-500">{info}</div>}
					{localError && <div className="text-xs text-red-500">{localError}</div>}

					<div className="flex items-center gap-2">
						<input
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							disabled={!canSend}
							className="flex-1 px-4 py-3 rounded-2xl border outline-none focus:ring-2 disabled:opacity-60"
							style={{
								backgroundColor: theme.mainChat.inputBackground,
								borderColor: theme.mainChat.border,
								color: theme.mainChat.text,
							}}
							placeholder={`Napisz wiadomość do ${inputTargetLabel}…`}
						/>
						<button type="submit" disabled={!canSend} className="px-4 py-3 rounded-2xl text-white hover:brightness-110 transition disabled:opacity-60" style={{ backgroundColor: theme.accent }}>
							{isSending ? "..." : "Wyślij"}
						</button>
					</div>
				</div>
			</form>
		</main>
	);
}
