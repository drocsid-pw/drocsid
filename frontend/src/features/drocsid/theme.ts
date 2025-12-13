export type DrocsidThemeKey = "light" | "dark";

export type DrocsidAreaColors = {
	background: string;
	border: string;
	text: string;
	headline: string;
};

export type DrocsidTheme = {
	appBackground: string;

	serversBar: DrocsidAreaColors & {
		divider: string;
	};

	channelsBar: DrocsidAreaColors & {
		sectionLabel: string;
	};

	mainChat: {
		background: string;
		headerBackground: string;
		inputBackground: string;
		border: string;
		text: string;
		headline: string;
	};

	accent: string;
	accentSoft: string;
	accentSoftHover: string;
};

export const DROCSID_THEMES: Record<DrocsidThemeKey, DrocsidTheme> = {
	dark: {
		appBackground: "#121214",

		serversBar: {
			background: "#121214",
			border: "#212124",
			text: "#f9fafb",
			headline: "#f9fafb",
			divider: "#212124",
		},

		channelsBar: {
			background: "#121214",
			border: "#212124",
			text: "#e5e7eb",
			headline: "#e5e7eb",
			sectionLabel: "#9ca3af",
		},

		mainChat: {
			background: "#1a1a1e",
			headerBackground: "#1a1a1e",
			inputBackground: "#222327",
			border: "#212124",
			text: "#e5e7eb",
			headline: "#ffffff",
		},

		accent: "#5865F2",
		accentSoft: "rgba(88,101,242,0.15)",
		accentSoftHover: "rgba(88,101,242,0.25)",
	},

	light: {
		appBackground: "#e5e7eb",

		serversBar: {
			background: "#e5e7eb",
			border: "rgba(15,23,42,0.12)",
			text: "#111827",
			headline: "#111827",
			divider: "rgba(15,23,42,0.12)",
		},

		channelsBar: {
			background: "#f9fafb",
			border: "rgba(15,23,42,0.12)",
			text: "#111827",
			headline: "#111827",
			sectionLabel: "#6b7280",
		},

		mainChat: {
			background: "#ffffff",
			headerBackground: "#f9fafb",
			inputBackground: "#ffffff",
			border: "rgba(15,23,42,0.12)",
			text: "#111827",
			headline: "#111827",
		},

		accent: "#5865F2",
		accentSoft: "rgba(88,101,242,0.12)",
		accentSoftHover: "rgba(88,101,242,0.18)",
	},
};
