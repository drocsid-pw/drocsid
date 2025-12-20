import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export const GOOGLE_ID_TOKEN_STORAGE_KEY = "drocsid.googleIdToken";

export type GoogleIdTokenPayload = {
	sub: string;
	name?: string;
	email?: string;
	picture?: string;
};

type AuthContextValue = {
	token: string | null;
	callerId: string | null;
	payload: GoogleIdTokenPayload | null;
	isAuthenticated: boolean;
	setToken: (token: string) => void;
	clearToken: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function base64UrlToBase64(input: string): string {
	return input.replace(/-/g, "+").replace(/_/g, "/");
}

function decodeBase64(input: string): string {
	const normalized = base64UrlToBase64(input);
	const padLen = (4 - (normalized.length % 4)) % 4;
	const padded = normalized + "=".repeat(padLen);
	return atob(padded);
}

export function decodeGoogleIdTokenPayload(token: string): GoogleIdTokenPayload | null {
	const parts = token.split(".");
	if (parts.length < 2) {
		return null;
	}

	try {
		const json = decodeBase64(parts[1]);
		const raw = JSON.parse(json) as Record<string, unknown>;

		const sub = typeof raw.sub === "string" ? raw.sub : null;
		if (!sub) {
			return null;
		}

		return {
			sub,
			name: typeof raw.name === "string" ? raw.name : undefined,
			email: typeof raw.email === "string" ? raw.email : undefined,
			picture: typeof raw.picture === "string" ? raw.picture : undefined,
		};
	} catch {
		return null;
	}
}

export function AuthProvider(props: { children: React.ReactNode }) {
	const { children } = props;

	const [token, setTokenState] = useState<string | null>(() => {
		if (typeof window === "undefined") {
			return null;
		}
		return window.localStorage.getItem(GOOGLE_ID_TOKEN_STORAGE_KEY);
	});

	const payload = useMemo(() => {
		if (!token) {
			return null;
		}
		return decodeGoogleIdTokenPayload(token);
	}, [token]);

	const callerId = payload?.sub ?? null;

	const setToken = useCallback((next: string) => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(GOOGLE_ID_TOKEN_STORAGE_KEY, next);
		}
		setTokenState(next);
	}, []);

	const clearToken = useCallback(() => {
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(GOOGLE_ID_TOKEN_STORAGE_KEY);
		}
		setTokenState(null);
	}, []);

	const value = useMemo<AuthContextValue>(() => {
		return {
			token,
			callerId,
			payload,
			isAuthenticated: !!token && !!callerId,
			setToken,
			clearToken,
		};
	}, [token, callerId, payload, setToken, clearToken]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used inside AuthProvider");
	}
	return ctx;
}
