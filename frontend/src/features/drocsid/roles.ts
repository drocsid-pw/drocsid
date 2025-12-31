import type { DrocsidPermission, DrocsidRole } from "./types";
import { serializePermissions } from "./types";
import { permissionsStringToRecord, recordToPermissionsString, type PermissionsRecord } from "./permissions";

export type RoleForm = {
	guildRoleId: string;
	roleName: string;
	permissions: PermissionsRecord;
	isNew: boolean;
	system?: boolean;
};

function permissionsArrayToRecord(permissions: DrocsidPermission[]): PermissionsRecord {
	/**
	 * Converts a typed permissions array into PermissionsRecord used by forms/UI.
	 */
	const out = permissionsStringToRecord("");
	for (const p of permissions) {
		out[p as keyof PermissionsRecord] = true;
	}
	return out;
}

function recordToPermissionsArray(record: PermissionsRecord): DrocsidPermission[] {
	/**
	 * Converts PermissionsRecord into a typed permissions array (only enabled flags).
	 */
	return Object.entries(record)
		.filter(([, enabled]) => enabled)
		.map(([key]) => key as DrocsidPermission);
}

export function rolesToRoleForms(roles: DrocsidRole[] | undefined): RoleForm[] {
	/**
	 * Maps DrocsidRole objects into a form-friendly structure:
	 * - permissions are converted from array into PermissionsRecord
	 * - existing roles are marked as isNew: false
	 */
	if (!roles) return [];

	return roles.map((r) => ({
		guildRoleId: r.guildRoleId,
		roleName: r.roleName,
		permissions: permissionsArrayToRecord(r.permissions),
		isNew: false,
		system: r.system,
	}));
}

export function roleFormToDrocsidRole(form: RoleForm): DrocsidRole {
	/**
	 * Converts RoleForm back into DrocsidRole (frontend domain shape):
	 * - trims roleName
	 * - keeps permissions as typed array
	 * - also generates permissionsRaw for backend-compatibility / transport
	 */
	const permissions = recordToPermissionsArray(form.permissions);

	return {
		guildRoleId: form.guildRoleId,
		roleName: form.roleName.trim(),
		permissions,
		permissionsRaw: serializePermissions(permissions, ","),
		system: form.system,
	};
}

export function roleFormToBackendPermissionsString(form: RoleForm): string {
	/**
	 * Serializes RoleForm permissions into the backend transport format (string).
	 * Use this when building API DTOs, if your backend still expects a string.
	 */
	return recordToPermissionsString(form.permissions);
}
