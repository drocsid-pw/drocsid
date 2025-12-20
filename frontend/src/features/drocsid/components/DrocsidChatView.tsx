import React from "react";
import type { DrocsidMessage } from "../types";
import { useDrocsidTheme } from "../theme-provider";

type DrocsidChatViewProps = {
	title: string;
	messages: DrocsidMessage[];
	isDm: boolean;
};

/**
 * Wyświetla okno czatu dla kanału serwerowego lub prywatnej rozmowy.
 */
export function DrocsidChatView(props: DrocsidChatViewProps) {
	const { title, messages, isDm } = props;

	const { theme } = useDrocsidTheme();

	const displayTitle = title || (isDm ? "Znajomy" : "brak-kanału");
	const inputTargetLabel = isDm ? displayTitle : `#${displayTitle}`;

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
								<span className="text-xs text-slate-500">{message.timestamp}</span>
							</div>
							<div style={{ color: theme.mainChat.text }}>{message.content}</div>
						</div>
					</div>
				))}

				{messages.length === 0 && (
					<div className="text-sm" style={{ color: theme.mainChat.text }}>
						Brak wiadomości. Napisz coś jako pierwszy.
					</div>
				)}
			</div>

			<form
				className="p-4 border-t"
				style={{
					backgroundColor: theme.mainChat.headerBackground,
					borderColor: theme.mainChat.border,
				}}
				onSubmit={(event) => {
					event.preventDefault();
					alert("To jeszcze nie wysyła wiadomości. Na razie jest to mock.");
				}}>
				<div className="flex items-center gap-2">
					<input
						className="flex-1 px-4 py-3 rounded-2xl border outline-none focus:ring-2"
						style={{
							backgroundColor: theme.mainChat.inputBackground,
							borderColor: theme.mainChat.border,
							color: theme.mainChat.text,
						}}
						placeholder={`Napisz wiadomość do ${inputTargetLabel}…`}
					/>
					<button type="submit" className="px-4 py-3 rounded-2xl text-white hover:brightness-110 transition" style={{ backgroundColor: theme.accent }}>
						Wyślij
					</button>
				</div>
			</form>
		</main>
	);
}
