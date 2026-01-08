import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
	/**
	 * Computes initial theme:
	 * - prefers value stored in localStorage (if valid)
	 * - otherwise uses OS preference (prefers-color-scheme)
	 * - defaults to "dark" in non-browser environments
	 */
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

export function DrocsidThemeProvider(props: { children: React.ReactNode }) {
	/**
	 * Single source of truth for the Drocsid theme:
	 * - stores themeKey in React state
	 * - persists themeKey to localStorage
	 * - updates documentElement: classList("dark") and style.colorScheme
	 * - exposes { themeKey, setThemeKey, theme, isDark } via hook
	 */
	const { children } = props;

	const [themeKey, setThemeKeyState] = useState<DrocsidThemeKey>(() => getInitialDrocsidThemeKey());

	const setThemeKey = useCallback((next: DrocsidThemeKey) => {
		setThemeKeyState(next);
	}, []);

	const isDark = themeKey === "dark";

	const theme = useMemo(() => {
		return DROCSID_THEMES[themeKey];
	}, [themeKey]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(DROCSID_THEME_STORAGE_KEY, themeKey);
	}, [themeKey]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const el = document.documentElement;
		el.style.colorScheme = themeKey;
		el.classList.toggle("dark", isDark);

		window.dispatchEvent(new Event("drocsid:theme-change"));
	}, [themeKey, isDark]);

	const value = useMemo<DrocsidThemeContextValue>(() => {
		return { themeKey, setThemeKey, theme, isDark };
	}, [themeKey, setThemeKey, theme, isDark]);

	return <DrocsidThemeContext.Provider value={value}>{children}</DrocsidThemeContext.Provider>;
}

export function useDrocsidTheme(): DrocsidThemeContextValue {
	const ctx = useContext(DrocsidThemeContext);
	if (!ctx) {
		throw new Error("useDrocsidTheme must be used inside DrocsidThemeProvider");
	}
	return ctx;
}
