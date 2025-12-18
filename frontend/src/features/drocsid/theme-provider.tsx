import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DROCSID_THEMES, type DrocsidTheme, type DrocsidThemeKey } from "./theme";

export const DROCSID_THEME_STORAGE_KEY = "drocsid.theme";

type DrocsidThemeContextValue = {
	themeKey: DrocsidThemeKey;
	setThemeKey: (next: DrocsidThemeKey) => void;
	theme: DrocsidTheme;
	isDark: boolean;
};

const DrocsidThemeContext = createContext<DrocsidThemeContextValue | null>(null);

function isThemeKey(value: string): value is DrocsidThemeKey {
	return value === "light" || value === "dark";
}

export function getInitialDrocsidThemeKey(): DrocsidThemeKey {
	if (typeof window === "undefined") {
		return "dark";
	}

	const stored = window.localStorage.getItem(DROCSID_THEME_STORAGE_KEY);
	if (stored && isThemeKey(stored)) {
		return stored;
	}

	if (window.matchMedia) {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		return prefersDark ? "dark" : "light";
	}

	return "dark";
}

/**
 * Jedno źródło prawdy o theme dla drocsida:
 * - trzyma themeKey w state
 * - zapisuje do localStorage
 * - ustawia html.classList("dark") i html.style.colorScheme
 * - daje theme + isDark do hooka
 */
export function DrocsidThemeProvider(props: { children: React.ReactNode }) {
	const { children } = props;

	const [themeKey, setThemeKey] = useState<DrocsidThemeKey>(() => getInitialDrocsidThemeKey());

	const isDark = themeKey === "dark";

	const theme = useMemo(() => {
		return DROCSID_THEMES[themeKey];
	}, [themeKey]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(DROCSID_THEME_STORAGE_KEY, themeKey);

		const el = document.documentElement;
		el.style.colorScheme = themeKey;
		el.classList.toggle("dark", isDark);

		window.dispatchEvent(new Event("drocsid:theme-change"));
	}, [themeKey, isDark]);

	const value = useMemo<DrocsidThemeContextValue>(() => {
		return { themeKey, setThemeKey, theme, isDark };
	}, [themeKey, theme, isDark]);

	return <DrocsidThemeContext.Provider value={value}>{children}</DrocsidThemeContext.Provider>;
}

export function useDrocsidTheme() {
	const ctx = useContext(DrocsidThemeContext);
	if (!ctx) {
		throw new Error("useDrocsidTheme must be used inside DrocsidThemeProvider");
	}
	return ctx;
}
