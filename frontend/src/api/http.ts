// ./frontend/src/api/http.ts
export type ApiErrorBody = {
	code: string;
	message: string;
	details?: Record<string, unknown>;
};

export type ApiErrorResponse = {
	error: ApiErrorBody;
};

export class DrocsidApiError extends Error {
	status: number;
	code: string;
	details: Record<string, unknown>;

	constructor(args: { status: number; code: string; message: string; details?: Record<string, unknown> }) {
		super(args.message);
		this.name = "DrocsidApiError";
		this.status = args.status;
		this.code = args.code;
		this.details = args.details ?? {};
	}
}

export function isDrocsidApiError(error: unknown): error is DrocsidApiError {
	return typeof error === "object" && error !== null && "name" in error && (error as { name?: string }).name === "DrocsidApiError";
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export type RequestJsonOptions<T = unknown> = {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	token?: string | null;
	query?: Record<string, string | number | boolean | null | undefined>;
	body?: unknown;

	/**
	 * Jeśli backend zwróci literalne JSON null albo puste body (200 + Content-Length: 0),
	 * to zamiast wywalać błąd zwrócimy fallback (idealne pod endpointy listujące).
	 */
	nullFallback?: T;
};

function buildUrl(path: string, query?: RequestJsonOptions["query"]): URL {
	const base = API_BASE_URL.replace(/\/$/, "");
	const p = path.startsWith("/") ? path : `/${path}`;
	const full = `${base}${p}`;

	const url = full.startsWith("http://") || full.startsWith("https://") ? new URL(full) : new URL(full, window.location.origin);

	if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value === null || value === undefined) continue;
			url.searchParams.set(key, String(value));
		}
	}

	return url;
}

function toBearer(token: string): string {
	return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function asApiErrorResponse(value: unknown): ApiErrorResponse | null {
	if (!isRecord(value)) return null;

	const err = value.error;
	if (!isRecord(err)) return null;

	const code = err.code;
	const message = err.message;

	if (typeof code !== "string" || typeof message !== "string") return null;

	const details = isRecord(err.details) ? (err.details as Record<string, unknown>) : undefined;
	return { error: { code, message, details } };
}

type ParsedJsonBody = { ok: true; data: unknown; text: string; isEmpty: boolean } | { ok: false; text: string };

function snippet(text: string, max = 600): string {
	const t = text.trim();
	return t.length <= max ? t : `${t.slice(0, max)}…`;
}

async function parseJsonBody(res: Response): Promise<ParsedJsonBody> {
	const text = await res.text();
	if (!text.trim()) {
		return { ok: true, data: undefined, text, isEmpty: true };
	}

	try {
		return { ok: true, data: JSON.parse(text) as unknown, text, isEmpty: false };
	} catch {
		return { ok: false, text };
	}
}

export async function requestJson<T>(opts: RequestJsonOptions<T>): Promise<T> {
	const method = opts.method ?? "GET";
	const url = buildUrl(opts.path, opts.query);

	const headers: Record<string, string> = {
		Accept: "application/json",
	};

	if (opts.token) {
		headers.Authorization = toBearer(opts.token);
	}

	let body: string | undefined;
	if (opts.body !== undefined) {
		headers["Content-Type"] = "application/json";
		body = JSON.stringify(opts.body);
	}

	const res = await fetch(url.toString(), { method, headers, body });

	if (!res.ok) {
		const parsed = await parseJsonBody(res);
		const payload = parsed.ok ? asApiErrorResponse(parsed.data) : null;

		const code = payload?.error?.code ?? "INTERNAL";
		const message = payload?.error?.message ?? `HTTP ${res.status}`;
		const details = payload?.error?.details ?? {
			url: url.toString(),
			responseText: snippet(parsed.text),
		};

		throw new DrocsidApiError({ status: res.status, code, message, details });
	}

	if (res.status === 204) {
		return undefined as T;
	}

	const parsed = await parseJsonBody(res);

	if (!parsed.ok) {
		throw new DrocsidApiError({
			status: res.status,
			code: "INTERNAL",
			message: "Invalid JSON response",
			details: {
				url: url.toString(),
				responseText: snippet(parsed.text),
			},
		});
	}

	if (parsed.isEmpty) {
		if (opts.nullFallback !== undefined) {
			return opts.nullFallback;
		}

		const allowEmpty = method === "DELETE";
		if (allowEmpty) {
			return undefined as T;
		}

		throw new DrocsidApiError({
			status: res.status,
			code: "INTERNAL",
			message: "Empty JSON response",
			details: { url: url.toString() },
		});
	}

	if (parsed.data === null) {
		if (opts.nullFallback !== undefined) {
			return opts.nullFallback;
		}
		throw new DrocsidApiError({
			status: res.status,
			code: "INTERNAL",
			message: "Invalid JSON response",
			details: { url: url.toString() },
		});
	}

	return parsed.data as T;
}
