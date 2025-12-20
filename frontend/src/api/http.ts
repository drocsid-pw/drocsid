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

type RequestJsonOptions = {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	token?: string | null;
	query?: Record<string, string | number | boolean | null | undefined>;
	body?: unknown;
};

function buildUrl(path: string, query?: RequestJsonOptions["query"]): URL {
	const base = API_BASE_URL.replace(/\/$/, "");
	const p = path.startsWith("/") ? path : `/${path}`;
	const full = `${base}${p}`;

	const url = full.startsWith("http://") || full.startsWith("https://") ? new URL(full) : new URL(full, window.location.origin);

	if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value === null || value === undefined) {
				continue;
			}
			url.searchParams.set(key, String(value));
		}
	}

	return url;
}

async function safeParseJson<T>(res: Response): Promise<T | null> {
	try {
		return (await res.json()) as T;
	} catch {
		return null;
	}
}

function toBearer(token: string): string {
	return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

export async function requestJson<T>(opts: RequestJsonOptions): Promise<T> {
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

	const res = await fetch(url.toString(), {
		method,
		headers,
		body,
	});

	if (!res.ok) {
		const payload = await safeParseJson<ApiErrorResponse>(res);

		const code = payload?.error?.code ?? "INTERNAL";
		const message = payload?.error?.message ?? `HTTP ${res.status}`;
		const details = payload?.error?.details ?? {};

		throw new DrocsidApiError({ status: res.status, code, message, details });
	}

	if (res.status === 204) {
		return undefined as T;
	}

	const data = await safeParseJson<T>(res);
	if (data === null) {
		throw new DrocsidApiError({ status: 500, code: "INTERNAL", message: "Invalid JSON response" });
	}

	return data;
}
