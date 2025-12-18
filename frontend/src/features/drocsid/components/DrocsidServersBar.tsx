import React from "react";
import type { DrocsidServer } from "../types";
import { useDrocsidTheme } from "../theme-provider";

type DrocsidSideMode = "servers" | "friends";

type DrocsidServersBarProps = {
	servers: DrocsidGuild[];
	activeServerId: bigint | null;
	sideMode: DrocsidSideMode;
	onSelectSideMode: (mode: DrocsidSideMode) => void;
	onSelectServer: (serverId: string) => void;
	onOpenCreateServer: () => void;
};

export function DrocsidServersBar(props: DrocsidServersBarProps) {
	const { servers, activeServerId, sideMode, onSelectSideMode, onSelectServer, onOpenCreateServer } = props;

	const { theme } = useDrocsidTheme();

	return (
		<aside
			className="flex flex-col items-center gap-3 py-3"
			style={{
				backgroundColor: theme.serversBar.background,
				color: theme.serversBar.text,
			}}>
			<button
				type="button"
				className={`w-12 h-12 rounded-2xl grid place-items-center text-xl font-bold transition ${sideMode === "friends" ? "bg-white text-[#1f2937]" : "bg-white/10 hover:bg-white/20"}`}
				title="Prywatne wiadomości"
				onClick={() => onSelectSideMode("friends")}>
				d
			</button>

			<div className="w-8 h-px my-2" style={{ backgroundColor: theme.serversBar.divider }} />

			{servers.map((server) => {
				const isActive = sideMode === "servers" && activeServerId !== null && server.id === activeServerId;

				return (
					<button
						key={String(server.id)}
						type="button"
						className={`w-12 h-12 rounded-2xl grid place-items-center transition ${isActive ? "bg-white text-[#1f2937]" : "bg-white/10 hover:bg-white/20"}`}
						title={server.name}
						onClick={() => {
							onSelectSideMode("servers");
							onSelectServer(server.id);
						}}>
						<span className="text-xl">{server.icon}</span>
					</button>
				);
			})}

			<div className="mt-auto mb-1">
				<button type="button" className="w-12 h-12 rounded-2xl grid place-items-center bg-white/10 hover:bg-white/20 transition" title="Utwórz serwer" onClick={onOpenCreateServer}>
					+
				</button>
			</div>
		</aside>
	);
}
