import type { ChannelDto, GuildDto, GuildUserDto, MessageDto, RoleDto, RoleListDto, UserDto } from "../../api/drocsidApi";
import type { DrocsidChannel, DrocsidGuild, DrocsidGuildUser, DrocsidMessage, DrocsidRole, DrocsidRoleList, DrocsidUser } from "./types";

function str(value: string | null | undefined): string {
	return typeof value === "string" ? value : "";
}

function isSystemRoleName(roleName: string): boolean {
	return roleName === "@owner" || roleName === "@everyone";
}

export function avatarLetterFromName(name: string): string {
	const trimmed = (name ?? "").trim();
	if (!trimmed) {
		return "?";
	}
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
	const roleName = str(dto.roleName);
	return {
		guildRoleId: str(dto.guildRoleId),
		roleName,
		permissions: str(dto.permissions),
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
	return {
		guildUserId: str(dto.guildUserId),
		nick: str(dto.nick),
		roles: mapRoleListDto(dto.roles),
	};
}

export function mapMessageDto(dto: MessageDto, opts?: { timestamp?: string }): DrocsidMessage {
	const author = dto.author ? mapGuildUserDto(dto.author) : { guildUserId: "", nick: "unknown", roles: { roles: [] } };

	return {
		messageId: str(dto.messageId),
		author,
		content: str(dto.content),
		timestamp: opts?.timestamp ?? "",
	};
}

export function toApiRoleDto(role: DrocsidRole): RoleDto {
	return {
		guildRoleId: role.guildRoleId,
		roleName: role.roleName,
		permissions: role.permissions,
	};
}

export function toApiRoleListDto(list: DrocsidRoleList): RoleListDto {
	return { roles: list.roles.map(toApiRoleDto) };
}
