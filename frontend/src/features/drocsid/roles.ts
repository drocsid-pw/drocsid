import type { DrocsidRole } from "./types";
import { permissionsListToRecord, recordToPermissionsList, recordToPermissionsString, type PermissionsRecord } from "./permissions";

export type ProtoRole = {
	guild_role_id: string;
	role_name: string;
	permissions: string;
};

export type RoleForm = {
	guild_role_id: string;
	role_name: string;
	permissions: PermissionsRecord;
	isNew: boolean;
	system?: boolean;
};

export function rolesToRoleForms(roles: DrocsidRole[] | undefined): RoleForm[] {
	if (!roles) {
		return [];
	}

	return roles.map((r) => ({
		guild_role_id: r.id,
		role_name: r.name,
		permissions: permissionsListToRecord(r.permissions),
		isNew: false,
		system: r.system,
	}));
}

export function roleFormToProtoRole(form: RoleForm): ProtoRole {
	return {
		guild_role_id: form.guild_role_id,
		role_name: form.role_name.trim(),
		permissions: recordToPermissionsString(form.permissions),
	};
}

export function roleFormToDrocsidRole(form: RoleForm): DrocsidRole {
	return {
		id: form.guild_role_id,
		name: form.role_name.trim(),
		permissions: recordToPermissionsList(form.permissions),
		system: form.system,
	};
}
