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

function safeGetStorage(): Storage | null {
	return typeof window === "undefined" ? null : window.localStorage;
}

function readTokenFromStorage(): string | null {
	const storage = safeGetStorage();
	return storage ? storage.getItem(GOOGLE_ID_TOKEN_STORAGE_KEY) : null;
}

function writeTokenToStorage(token: string): void {
	const storage = safeGetStorage();
	if (storage) {
		storage.setItem(GOOGLE_ID_TOKEN_STORAGE_KEY, token);
	}
}

function removeTokenFromStorage(): void {
	const storage = safeGetStorage();
	if (storage) {
		storage.removeItem(GOOGLE_ID_TOKEN_STORAGE_KEY);
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function decodeBase64UrlUtf8(input: string): string {
	const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
	const padLen = (4 - (base64.length % 4)) % 4;
	const padded = base64 + "=".repeat(padLen);

	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

export function decodeGoogleIdTokenPayload(token: string): GoogleIdTokenPayload | null {
	/**
	 * Extracts a minimal Google ID token payload from a JWT string.
	 * This is a best-effort decoder meant for UI usage only (no signature verification).
	 *
	 * Uses UTF-8 safe decoding (atob alone can break for non-ascii names).
	 */
	const parts = token.split(".");
	if (parts.length < 2) {
		return null;
	}

	try {
		const json = decodeBase64UrlUtf8(parts[1]);
		const raw = JSON.parse(json) as unknown;

		if (!isRecord(raw)) {
			return null;
		}

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
	/**
	 * Provides authentication state derived from a Google ID token:
	 * - persists token in localStorage
	 * - decodes payload (best-effort) to expose callerId (payload.sub) and basic profile fields
	 * - exposes setToken/clearToken helpers
	 */
	const { children } = props;

	const [token, setTokenState] = useState<string | null>(() => readTokenFromStorage());

	const payload = useMemo(() => {
		return token ? decodeGoogleIdTokenPayload(token) : null;
	}, [token]);

	const callerId = payload?.sub ?? null;

	const setToken = useCallback((next: string) => {
		writeTokenToStorage(next);
		setTokenState(next);
	}, []);

	const clearToken = useCallback(() => {
		removeTokenFromStorage();
		setTokenState(null);
	}, []);

	const value = useMemo<AuthContextValue>(() => {
		return {
			token,
			callerId,
			payload,
			isAuthenticated: Boolean(token && callerId),
			setToken,
			clearToken,
		};
	}, [token, callerId, payload, setToken, clearToken]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	/**
	 * Reads AuthContext value. Must be used under <AuthProvider />.
	 */
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used inside AuthProvider");
	}
	return ctx;
}
