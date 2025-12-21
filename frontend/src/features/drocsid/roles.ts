import type { DrocsidRole } from "./types";
import { permissionsStringToRecord, recordToPermissionsString, type PermissionsRecord } from "./permissions";

export type RoleForm = {
	guildRoleId: string;
	roleName: string;
	permissions: PermissionsRecord;
	isNew: boolean;
	system?: boolean;
};

export function rolesToRoleForms(roles: DrocsidRole[] | undefined): RoleForm[] {
	if (!roles) {
		return [];
	}

	return roles.map((r) => ({
		guildRoleId: r.guildRoleId,
		roleName: r.roleName,
		permissions: permissionsStringToRecord(r.permissions),
		isNew: false,
		system: r.system,
	}));
}

export function roleFormToDrocsidRole(form: RoleForm): DrocsidRole {
	return {
		guildRoleId: form.guildRoleId,
		roleName: form.roleName.trim(),
		permissions: recordToPermissionsString(form.permissions),
		system: form.system,
	};
}
