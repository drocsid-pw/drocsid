import type { DrocsidPermission } from "./types";
import { parsePermissions, serializePermissions } from "./types";

export type PermissionFlag = DrocsidPermission;

export const PERMISSION_FLAGS = [
	"MANAGE_GUILD_USERS",
	"MANAGE_CHANNEL",
	"ADMIN_DELETE_MESSAGES",
	"MANAGE_GUILD",
	"READ",
	"WRITE",
] as const satisfies readonly PermissionFlag[];

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
	/**
	 * Converts backend permissions string into PermissionsRecord for UI.
	 * Delegates parsing rules to parsePermissions to keep behavior consistent across the app.
	 */
	const base = emptyPermissionsRecord();

	if (!raw) return base;

	for (const p of parsePermissions(raw)) {
		base[p] = true;
	}

	return base;
}

export function recordToPermissionsString(record: PermissionsRecord, separator = ","): string {
	/**
	 * Serializes PermissionsRecord into a string for transport/storage.
	 * Separator can be adjusted to match backend expectations.
	 */
	const list = recordToPermissionsList(record);
	return serializePermissions(list, separator);
}

export function togglePermissionString(raw: string, flag: PermissionFlag, separator = ","): string {
	/**
	 * Toggles a single permission inside a raw permissions string and returns a normalized string.
	 */
	const record = permissionsStringToRecord(raw);
	record[flag] = !record[flag];
	return recordToPermissionsString(record, separator);
}

export function recordToPermissionsList(record: PermissionsRecord): DrocsidPermission[] {
	/**
	 * Converts PermissionsRecord into a typed permissions list.
	 */
	return PERMISSION_FLAGS.filter((flag) => record[flag]);
}

export function permissionsListToRecord(raw: DrocsidPermission[] | string | undefined): PermissionsRecord {
	/**
	 * Converts either a permissions list (preferred) or a raw string (legacy/backend) into PermissionsRecord.
	 */
	if (typeof raw === "string") {
		return permissionsStringToRecord(raw);
	}

	const base = emptyPermissionsRecord();

	for (const key of raw ?? []) {
		base[key] = true;
	}

	return base;
}
