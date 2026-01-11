import React, { useCallback, useMemo, useRef, useState } from "react";
import type { DrocsidMessage } from "../types";
import { useDrocsidTheme } from "../theme-provider";

type DrocsidChatViewProps = {
	title: string;
	messages: DrocsidMessage[];
	isDm: boolean;
	onSendMessage?: (content: string) => Promise<void> | void;
	onSendImage?: (file: File) => Promise<void> | void;
	sendDisabledReason?: string;
	isSending?: boolean;
};

type ChatHeaderProps = {
	title: string;
	isDm: boolean;
	backgroundColor: string;
	borderColor: string;
	headlineColor: string;
};

function ChatHeader(props: ChatHeaderProps) {
	const { title, isDm, backgroundColor, borderColor, headlineColor } = props;

	return (
		<div
			className="h-12 px-4 border-b flex items-center gap-3"
			style={{
				backgroundColor,
				borderColor,
			}}>
			<div className="text-slate-400">{isDm ? <span className="inline-block w-6 h-6 rounded-full bg-slate-300 grid place-items-center text-xs">🙂</span> : "#"}</div>
			<div className="font-medium" style={{ color: headlineColor }}>
				{title}
			</div>
		</div>
	);
}

function tryParseImageUrlFromMessageContent(raw: string): string | null {
	const s = (raw ?? "").trim();
	if (!s) return null;

	const match = s.match(/^\s*<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>\s*$/i);
	if (!match) return null;

	const url = (match[2] ?? "").trim();
	if (!url) return null;

	const lower = url.toLowerCase();
	const isHttp = lower.startsWith("http://") || lower.startsWith("https://");
	const isRelative = lower.startsWith("/");
	if (!isHttp && !isRelative) {
		return null;
	}

	return url;
}

type MessageListProps = {
	messages: DrocsidMessage[];
	textColor: string;
	headlineColor: string;
};

function MessageList(props: MessageListProps) {
	const { messages, textColor, headlineColor } = props;

	if (messages.length === 0) {
		return (
			<div className="text-sm" style={{ color: textColor }}>
				Brak wiadomości.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{messages.map((message) => {
				const imgUrl = tryParseImageUrlFromMessageContent(message.content);

				return (
					<div key={message.messageId} className="flex gap-3">
						<div className="w-10 h-10 rounded-full bg-slate-300 grid place-items-center">👤</div>

						<div className="flex-1">
							<div className="flex items-baseline gap-2">
								<span className="font-semibold" style={{ color: headlineColor }}>
									{message.author.nick}
								</span>
								<span className="text-xs text-slate-500">{message.timestamp || ""}</span>
							</div>

							<div style={{ color: textColor }}>
								{imgUrl ? (
									<a href={imgUrl} target="_blank" rel="noreferrer" className="inline-block mt-1">
										<img src={imgUrl} alt="uploaded" className="max-w-[520px] w-full rounded-xl border border-slate-700/20 dark:border-white/10" loading="lazy" />
									</a>
								) : (
									message.content
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

type ComposerProps = {
	draft: string;
	onChangeDraft: (next: string) => void;
	onSubmitText: () => Promise<void>;
	onSubmitImage: (file: File) => Promise<void>;

	placeholder: string;
	canSend: boolean;
	isSending: boolean;
	info: string | null;
	localError: string | null;

	backgroundColor: string;
	borderColor: string;
	inputBackground: string;
	textColor: string;
	accentColor: string;
};

function Composer(props: ComposerProps) {
	const { draft, onChangeDraft, onSubmitText, onSubmitImage, placeholder, canSend, isSending, info, localError, backgroundColor, borderColor, inputBackground, textColor, accentColor } = props;

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const openPicker = () => {
		if (!canSend) return;
		fileInputRef.current?.click();
	};

	return (
		<form
			className="p-4 border-t"
			style={{
				backgroundColor,
				borderColor,
			}}
			onSubmit={async (event) => {
				event.preventDefault();
				await onSubmitText();
			}}>
			<div className="flex flex-col gap-2">
				{info && <div className="text-xs text-slate-500">{info}</div>}
				{localError && <div className="text-xs text-red-500">{localError}</div>}

				<div className="flex items-center gap-2">
					<button type="button" onClick={openPicker} disabled={!canSend} className="px-3 py-3 rounded-2xl border hover:bg-white/10 transition disabled:opacity-60" style={{ borderColor, color: textColor }} title="Załącz obrazek">
						📎
					</button>

					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={async (e) => {
							const file = e.target.files?.[0] ?? null;
							e.target.value = "";
							if (!file) return;
							await onSubmitImage(file);
						}}
					/>

					<input
						value={draft}
						onChange={(e) => onChangeDraft(e.target.value)}
						disabled={!canSend}
						className="flex-1 px-4 py-3 rounded-2xl border outline-none focus:ring-2 disabled:opacity-60"
						style={{
							backgroundColor: inputBackground,
							borderColor,
							color: textColor,
						}}
						placeholder={placeholder}
					/>

					<button type="submit" disabled={!canSend} className="px-4 py-3 rounded-2xl text-white hover:brightness-110 transition disabled:opacity-60" style={{ backgroundColor: accentColor }}>
						{isSending ? "..." : "Wyślij"}
					</button>
				</div>
			</div>
		</form>
	);
}

function getInfoMessage(args: { sendDisabledReason?: string; isDm: boolean; hasTextSender: boolean; hasImageSender: boolean }): string | null {
	if (args.sendDisabledReason) {
		return args.sendDisabledReason;
	}
	if (args.isDm && (!args.hasTextSender || !args.hasImageSender)) {
		return "DM-y nie są jeszcze podpięte w backendzie.";
	}
	return null;
}

export function DrocsidChatView(props: DrocsidChatViewProps) {
	const { title, messages, isDm, onSendMessage, onSendImage, sendDisabledReason, isSending } = props;

	const { theme } = useDrocsidTheme();

	const [draft, setDraft] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const displayTitle = title || (isDm ? "Prywatne wiadomości" : "brak-kanału");
	const inputTargetLabel = isDm ? displayTitle : `#${displayTitle}`;

	const hasTextSender = typeof onSendMessage === "function";
	const hasImageSender = typeof onSendImage === "function";

	const sending = !!isSending;
	const canSend = (hasTextSender || hasImageSender) && !sending && !sendDisabledReason;

	const info = useMemo(() => {
		return getInfoMessage({ sendDisabledReason, isDm, hasTextSender, hasImageSender });
	}, [sendDisabledReason, isDm, hasTextSender, hasImageSender]);

	const handleSubmitText = useCallback(async () => {
		setLocalError(null);

		if (!hasTextSender) return;

		const content = draft.trim();
		if (!content) return;

		try {
			await onSendMessage(content);
			setDraft("");
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Nie udało się wysłać wiadomości";
			setLocalError(msg);
		}
	}, [draft, hasTextSender, onSendMessage]);

	const handleSubmitImage = useCallback(
		async (file: File) => {
			setLocalError(null);

			if (!hasImageSender) return;

			const draftTrimmed = draft.trim();
			if (draftTrimmed) {
				setLocalError("Masz wpisany tekst w polu. Wyślij go albo wyczyść draft zanim wyślesz obrazek.");
				return;
			}

			if (!file.type.startsWith("image/")) {
				setLocalError("To nie wygląda jak obrazek.");
				return;
			}

			try {
				await onSendImage(file);
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Nie udało się wysłać obrazka";
				setLocalError(msg);
			}
		},
		[draft, hasImageSender, onSendImage]
	);

	return (
		<main className="h-full min-h-0 flex flex-col" style={{ backgroundColor: theme.mainChat.background }}>
			<ChatHeader title={displayTitle} isDm={isDm} backgroundColor={theme.mainChat.headerBackground} borderColor={theme.mainChat.border} headlineColor={theme.mainChat.headline} />

			<div className="flex-1 min-h-0 overflow-y-auto p-4">
				<MessageList messages={messages} textColor={theme.mainChat.text} headlineColor={theme.mainChat.headline} />
			</div>

			<Composer
				draft={draft}
				onChangeDraft={setDraft}
				onSubmitText={handleSubmitText}
				onSubmitImage={handleSubmitImage}
				placeholder={`Napisz wiadomość do ${inputTargetLabel}…`}
				canSend={canSend}
				isSending={sending}
				info={info}
				localError={localError}
				backgroundColor={theme.mainChat.headerBackground}
				borderColor={theme.mainChat.border}
				inputBackground={theme.mainChat.inputBackground}
				textColor={theme.mainChat.text}
				accentColor={theme.accent}
			/>
		</main>
	);
}
