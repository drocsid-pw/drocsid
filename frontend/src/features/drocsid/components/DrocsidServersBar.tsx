import React, { useMemo } from "react";
import type { DrocsidGuild } from "../types";
import { useDrocsidTheme } from "../theme-provider";

type DrocsidSideMode = "servers" | "friends";

type DrocsidServersBarProps = {
	servers: DrocsidGuild[];
	activeServerId: string | null;
	sideMode: DrocsidSideMode;
	onSelectSideMode: (mode: DrocsidSideMode) => void;
	onSelectServer: (guildId: string) => void;
	onOpenCreateServer: () => void;
};

type TileButtonProps = {
	children: React.ReactNode;
	isActive?: boolean;
	title: string;
	ariaLabel: string;
	onClick: () => void;
};

function TileButton(props: TileButtonProps) {
	const { children, isActive = false, title, ariaLabel, onClick } = props;

	const className = useMemo(() => {
		const base = "w-12 h-12 rounded-2xl grid place-items-center transition";
		const active = "bg-white text-[#1f2937]";
		const inactive = "bg-white/10 hover:bg-white/20";
		return `${base} ${isActive ? active : inactive}`;
	}, [isActive]);

	return (
		<button
			type="button"
			className={className}
			title={title}
			aria-label={ariaLabel}
			aria-current={isActive ? "page" : undefined}
			onClick={onClick}>
			{children}
		</button>
	);
}

function serverIcon(server: DrocsidGuild): string {
	const icon = (server.icon ?? "").trim();
	if (icon) {
		return icon;
	}
	const name = (server.name ?? "").trim();
	return name ? name[0]!.toUpperCase() : "?";
}

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
			<TileButton
				isActive={sideMode === "friends"}
				title="Prywatne wiadomości"
				ariaLabel="Open private messages"
				onClick={() => onSelectSideMode("friends")}>
				<span className="text-base font-bold">DM</span>
			</TileButton>

			<div className="w-8 h-px my-2" style={{ backgroundColor: theme.serversBar.divider }} aria-hidden />

			{servers.map((server) => {
				const isActive = sideMode === "servers" && activeServerId !== null && server.guildId === activeServerId;

				return (
					<TileButton
						key={server.guildId}
						isActive={isActive}
						title={server.name}
						ariaLabel={`Open server ${server.name}`}
						onClick={() => {
							onSelectSideMode("servers");
							onSelectServer(server.guildId);
						}}>
						<span className="text-xl">{serverIcon(server)}</span>
					</TileButton>
				);
			})}

			<div className="mt-auto mb-1">
				<TileButton
					title="Utwórz serwer"
					ariaLabel="Create a new server"
					onClick={onOpenCreateServer}>
					<span className="text-xl">+</span>
				</TileButton>
			</div>
		</aside>
	);
}
