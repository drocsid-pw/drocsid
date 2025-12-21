import type { DrocsidPermission } from "./types";

export type PermissionFlag = DrocsidPermission;

export const PERMISSION_FLAGS: PermissionFlag[] = ["MANAGE_GUILD_USERS", "MANAGE_CHANNEL", "ADMIN_DELETE_MESSAGES", "MANAGE_GUILD", "READ", "WRITE"];

export type PermissionsRecord = Record<PermissionFlag, boolean>;

export function emptyPermissionsRecord(): PermissionsRecord {
	return {
		MANAGE_GUILD_USERS: false,
		MANAGE_CHANNEL: false,
		ADMIN_DELETE_MESSAGES: false,
		MANAGE_GUILD: false,
		READ: false,
		WRITE: false,
	};
}

export function permissionsStringToRecord(raw: string | undefined): PermissionsRecord {
	const base = emptyPermissionsRecord();

	if (!raw) {
		return base;
	}

	const normalized = raw
		.split(/[\s,|]+/g)
		.map((s) => s.trim())
		.filter(Boolean);

	for (const key of normalized) {
		if (key in base) {
			base[key as PermissionFlag] = true;
		}
	}

	return base;
}

export function recordToPermissionsString(record: PermissionsRecord): string {
	return PERMISSION_FLAGS.filter((flag) => record[flag]).join("|");
}

export function togglePermissionString(raw: string, flag: PermissionFlag): string {
	const record = permissionsStringToRecord(raw);
	record[flag] = !record[flag];
	return recordToPermissionsString(record);
}

export function recordToPermissionsList(record: PermissionsRecord): DrocsidPermission[] {
	return PERMISSION_FLAGS.filter((flag) => record[flag]);
}

export function permissionsListToRecord(raw: DrocsidPermission[] | string | undefined): PermissionsRecord {
	if (typeof raw === "string") {
		return permissionsStringToRecord(raw);
	}

	const base = emptyPermissionsRecord();

	for (const key of raw ?? []) {
		if (key in base) {
			base[key as PermissionFlag] = true;
		}
	}

	return base;
}
