import type { ChannelDto, GuildDto, GuildUserDto, MessageDto, RoleDto, RoleListDto, UserDto } from "../../api/drocsidApi";
import type { DrocsidChannel, DrocsidGuild, DrocsidGuildUser, DrocsidMessage, DrocsidRole, DrocsidRoleList, DrocsidUser } from "./types";
import { parsePermissions, serializePermissions } from "./types";
import { BACKEND_PERMISSIONS_SEPARATOR } from "./permissions";

function str(value: string | null | undefined): string {
	return typeof value === "string" ? value : "";
}

function isSystemRoleName(roleName: string): boolean {
	return roleName === "@owner" || roleName === "@everyone";
}

export function avatarLetterFromName(name: string): string {
	const trimmed = (name ?? "").trim();
	if (!trimmed) return "?";
	return trimmed[0]?.toUpperCase() ?? "?";
}

export function mapUserDto(dto: UserDto, fallback?: { id?: string; name?: string }): DrocsidUser {
	const id = str(dto.id) || fallback?.id || "";
	const name = str(dto.name) || fallback?.name || "Ty";

	return {
		id,
		name,
		avatarHash: str(dto.avatarHash),
		avatarLetter: avatarLetterFromName(name),
	};
}

export function mapRoleDto(dto: RoleDto): DrocsidRole {
	/**
	 * Maps backend role DTO to frontend role model.
	 * Keeps backend compatibility by storing the original permissions string (permissionsRaw),
	 * while also providing a typed permissions array for UI logic.
	 */
	const roleName = str(dto.roleName);
	const permissionsRaw = str(dto.permissions);
	const permissions = parsePermissions(permissionsRaw);

	return {
		guildRoleId: str(dto.guildRoleId),
		roleName,
		permissions,
		permissionsRaw,
		system: isSystemRoleName(roleName) ? true : undefined,
	};
}

export function mapRoleListDto(dto: RoleListDto | null | undefined): DrocsidRoleList {
	const roles = dto?.roles ?? [];
	return { roles: roles.map(mapRoleDto) };
}

export function mapChannelDto(dto: ChannelDto): DrocsidChannel {
	return {
		channelId: str(dto.channelId),
		name: str(dto.name),
		guildId: str(dto.guildId),
		overrides: mapRoleListDto(dto.overrides),
		messages: [],
	};
}

export function mapGuildDto(dto: GuildDto): DrocsidGuild {
	return {
		guildId: str(dto.guildId),
		name: str(dto.name),
		icon: str(dto.icon),
		ownerId: str(dto.ownerId),
		roles: (dto.roles ?? []).map(mapRoleDto),
		channels: [],
		users: [],
	};
}

export function mapGuildUserDto(dto: GuildUserDto): DrocsidGuildUser {
	const roles = mapRoleListDto(dto.roles);
	const roleIds = roles.roles.map((r) => r.guildRoleId).filter((id) => id.length > 0);

	return {
		guildUserId: str(dto.guildUserId),
		nick: str(dto.nick),
		roles,
		roleIds,
	};
}

export function mapMessageDto(dto: MessageDto, opts?: { timestamp?: string }): DrocsidMessage {
	const author = dto.author
		? mapGuildUserDto(dto.author)
		: { guildUserId: "", nick: "unknown", roles: { roles: [] }, roleIds: [] };

	const timestamp = opts?.timestamp ?? str(dto.timestamp);

	return {
		messageId: str(dto.messageId),
		author,
		content: str(dto.content),
		timestamp,
	};
}

export function toApiRoleDto(role: DrocsidRole): RoleDto {
	/**
	 * Maps frontend role model back to API DTO.
	 * Backend expects permissions as a string; we prefer permissionsRaw if available to preserve formatting,
	 * otherwise we serialize the typed array.
	 */
	const permissions = role.permissionsRaw.length > 0 ? role.permissionsRaw : serializePermissions(role.permissions, BACKEND_PERMISSIONS_SEPARATOR);

	return {
		guildRoleId: role.guildRoleId,
		roleName: role.roleName,
		permissions,
	};
}

export function toApiRoleListDto(list: DrocsidRoleList): RoleListDto {
	return { roles: list.roles.map(toApiRoleDto) };
}
