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

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export type RequestJsonOptions<T = unknown> = {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	token?: string | null;
	query?: Query;
	body?: unknown;

	/**
	 * If the backend returns literal JSON `null` or an empty body (200 + Content-Length: 0),
	 * return `nullFallback` instead of throwing (useful for listing endpoints).
	 */
	nullFallback?: T;
};

type ParsedJsonBody = { ok: true; data: unknown; text: string; isEmpty: boolean } | { ok: false; text: string };

function buildUrl(path: string, query?: Query): URL {
	/**
	 * Builds a full URL from API_BASE_URL and path:
	 * - supports absolute base URLs or relative bases like "/api"
	 * - normalizes trailing/leading slashes
	 * - appends query params while skipping null/undefined values
	 */
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

function snippet(text: string, max = 600): string {
	const t = text.trim();
	return t.length <= max ? t : `${t.slice(0, max)}…`;
}

async function parseJsonBody(res: Response): Promise<ParsedJsonBody> {
	/**
	 * Safely reads and parses the response body as JSON:
	 * - if the body is empty/whitespace, it is treated as empty
	 * - if JSON parsing fails, returns the raw text for diagnostics
	 */
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

function makeInternalError(args: { status: number; message: string; url: string; responseText?: string }): DrocsidApiError {
	const details: Record<string, unknown> = { url: args.url };

	if (args.responseText) {
		details.responseText = snippet(args.responseText);
	}

	return new DrocsidApiError({
		status: args.status,
		code: "INTERNAL",
		message: args.message,
		details,
	});
}

function allowEmptyBody(args: { method: string; status: number }): boolean {
	return args.status === 204 || args.method === "DELETE";
}

export async function requestJson<T>(opts: RequestJsonOptions<T>): Promise<T> {
	/**
	 * A fetch wrapper that enforces a consistent API contract:
	 * - builds URL from API_BASE_URL + path + query (skips null/undefined query values)
	 * - when opts.token is provided, sends it as Authorization: Bearer <token>
	 * - JSON-serializes request body and sets Content-Type: application/json
	 * - for non-2xx responses, tries to map payload shape: { error: { code, message, details } }
	 * - supports `nullFallback` for listing endpoints (backend returns null or empty body)
	 * - allows empty body for DELETE and 204 responses and returns `undefined`
	 */
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
		throw makeInternalError({
			status: res.status,
			message: "Invalid JSON response",
			url: url.toString(),
			responseText: parsed.text,
		});
	}

	if (parsed.isEmpty) {
		if (opts.nullFallback !== undefined) {
			return opts.nullFallback;
		}

		if (allowEmptyBody({ method, status: res.status })) {
			return undefined as T;
		}

		throw makeInternalError({
			status: res.status,
			message: "Empty JSON response",
			url: url.toString(),
		});
	}

	if (parsed.data === null) {
		if (opts.nullFallback !== undefined) {
			return opts.nullFallback;
		}

		throw makeInternalError({
			status: res.status,
			message: "Invalid JSON response",
			url: url.toString(),
		});
	}

	return parsed.data as T;
}
