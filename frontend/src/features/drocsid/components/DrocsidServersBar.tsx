import React from "react";
import type { DrocsidGuild } from "../types";
import { DROCSID_THEME } from "../theme";

type DrocsidSideMode = "servers" | "friends";

type DrocsidServersBarProps = {
	servers: DrocsidGuild[];
	activeServerId: string | null;
	sideMode: DrocsidSideMode;
	onSelectSideMode: (mode: DrocsidSideMode) => void;
	onSelectServer: (serverId: string) => void;
	onOpenServerSettings: () => void;
};

/**
 * Pasek serwerów z przyciskiem prywatnych wiadomości u góry,
 * listą serwerów oraz przyciskiem dodania lub edycji serwera na dole.
 */
export function DrocsidServersBar(props: DrocsidServersBarProps) {
	const { servers, activeServerId, sideMode, onSelectSideMode, onSelectServer, onOpenServerSettings } = props;

	return (
		<aside
			className="flex flex-col items-center gap-3 py-3"
			style={{
				backgroundColor: DROCSID_THEME.serversBar.background,
				color: DROCSID_THEME.serversBar.text,
			}}>
			<button
				type="button"
				className={`w-12 h-12 rounded-2xl grid place-items-center text-xl font-bold transition ${sideMode === "friends" ? "bg-white text-[#1f2937]" : "bg-white/10 hover:bg-white/20"}`}
				title="Prywatne wiadomości"
				onClick={() => onSelectSideMode("friends")}>
				d
			</button>

			<div className="w-8 h-px my-2" style={{ backgroundColor: DROCSID_THEME.serversBar.divider }} />

			{servers.map((server) => {
				const isActive = sideMode === "servers" && server.id === activeServerId;

				return (
					<button
						key={server.id}
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
				<button type="button" className="w-12 h-12 rounded-2xl grid place-items-center bg-white/10 hover:bg-white/20 transition" title="Dodaj lub edytuj serwer" onClick={onOpenServerSettings}>
					+
				</button>
			</div>
		</aside>
	);
}
