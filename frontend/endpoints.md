# Drocsid REST API – endpoints

## 0) Konwencje

### 0.1 Base URL

`/api`

### 0.2 Auth – Google token w headerze

Każdy request (poza ewentualnymi publicznymi healthcheckami) musi zawierać Google ID token:

-   `Authorization: Bearer <google_id_token>`

Backend:

-   weryfikuje token po stronie serwera (signature / exp / aud / iss),
-   mapuje token → zewnętrzna tożsamość,
-   a `caller_id` traktuje jako wewnętrzny identyfikator do logiki uprawnień (nie jest “authem”).

### 0.3 caller_id

-   **GET**: `caller_id` w query: `?caller_id=4356534634563456`
-   **DELETE**: `caller_id` w query: `?caller_id=4356534634563456`
-   **POST / PUT**: `caller_id` w JSON body

### 0.4 Naming

-   JSON **camelCase** dla całej reszty: `guildId`, `channelId`, `guildRoleId`, `avatarHash`, `ownerId`, `messageId`
-   wyjątek: **`caller_id`** (snake_case)

### 0.5 PUT = update (pełny payload)

Update’y robimy przez `PUT` i **zawsze wysyłamy pełny payload**.

-   backend traktuje payload jako “source of truth”
-   brak reguł typu “brak pola = nie zmieniaj”
-   `Content-Type: application/json`

### 0.6 Standard błędu

```json
{
	"error": {
		"code": "FORBIDDEN",
		"message": "Brak uprawnień",
		"details": {}
	}
}
```

### 0.7 common.ResponseMessage

```json
{ "text": "ok" }
```

---

## 1) UserService

### 1.1 CreateUser

-   `POST /api/users`
-   body:

```json
{ "name": "Rafał" }
```

-   response (`user.User`):

```json
{ "id": "21341243", "name": "Rafał", "avatarHash": "234523452345" }
```

### 1.2 GetUser

-   `GET /api/users/{userId}?caller_id=4356534634563456`
-   response: `user.User`

### 1.3 PutUser

-   `PUT /api/users/{userId}`
-   body (partial):

```json
{ "caller_id": "23452345", "name": "Rafał", "avatarHash": "23452345" }
```

-   response: `user.User`

### 1.4 DeleteUser

-   `DELETE /api/users/{userId}?caller_id=4356534634563456`
-   response: `common.ResponseMessage`

---

## 2) GuildService

### 2.1 CreateGuild

-   `POST /api/guilds`
-   body:

```json
{ "caller_id": "23452345", "name": "Nowy serwer", "icon": "✨" }
```

-   response: `guild.Guild`

### 2.2 GetGuild

-   `GET /api/guilds/{guildId}?caller_id=4356534634563456`
-   response: `guild.Guild`

### 2.3 PutGuild

-   `PUT /api/guilds/{guildId}`
-   body (partial):

```json
{
	"caller_id": "4356534634563456",
	"guild": { "name": "drocsid / 23452534", "icon": "🏡" }
}
```

-   response: `guild.Guild`

### 2.4 DeleteGuild

-   `DELETE /api/guilds/{guildId}?caller_id=4356534634563456`
-   response: `common.ResponseMessage`

### 2.5 GetAllGuilds (dla usera)

-   `GET /api/users/{userId}/guilds?caller_id=4356534634563456`
-   response: `guild.GuildList`

```json
{
	"guilds": [{ "guildId": "34566", "name": "drocsid / 23452534", "icon": "🏡", "ownerId": "4356534634563456" }]
}
```

### 2.6 GetAllChannels (w guildzie)

-   `GET /api/guilds/{guildId}/channels?caller_id=4356534634563456`
-   response: `channel.ChannelList`

```json
{
	"channels": [{ "channelId": "11", "name": "general", "guildId": "23452534", "overrides": { "roles": [] } }]
}
```

---

## 2.7 Role management

### 2.7.1 GetRole

-   `GET /api/guilds/{guildId}/roles/{guildRoleId}?caller_id=4356534634563456`
-   response: `role.Role`

### 2.7.2 CreateRole

-   `POST /api/guilds/{guildId}/roles`
-   body:

```json
{
	"caller_id": "4356534634563456",
	"roleName": "Moderator",
	"permissions": "READ|WRITE|ADMIN_DELETE_MESSAGES"
}
```

-   response: `role.Role`

### 2.7.3 GetRoles

-   `GET /api/guilds/{guildId}/roles?caller_id=4356534634563456`
-   response: `role.RoleList`

```json
{
	"roles": [{ "guildRoleId": "2345235", "roleName": "Admin", "permissions": "READ|WRITE" }]
}
```

### 2.7.4 PutRole

-   `PUT /api/guilds/{guildId}/roles/{guildRoleId}`
-   body (partial):

```json
{
	"caller_id": "4356534634563456",
	"role": { "roleName": "Admin", "permissions": "MANAGE_GUILD_USERS|READ|WRITE" }
}
```

-   response: `role.Role`

### 2.7.5 DeleteRole (opcjonalnie)

-   `DELETE /api/guilds/{guildId}/roles/{guildRoleId}?caller_id=4356534634563456`
-   response: `common.ResponseMessage`

---

## 2.8 Channels w guildzie

### 2.8.1 CreateChannel

-   `POST /api/guilds/{guildId}/channels`
-   body:

```json
{ "caller_id": "4356534634563456", "name": "general" }
```

-   response: `channel.Channel`

---

## 2.9 Guild user management

### 2.9.1 AddUser (dodaj caller’a do guildy)

-   `POST /api/guilds/{guildId}/users`
-   body:

```json
{ "caller_id": "4356534634563456" }
```

-   response: `guild_user.GuildUser`

### 2.9.2 GetUser (w guildzie)

-   `GET /api/guilds/{guildId}/users/{guildUserId}?caller_id=4356534634563456`
-   response: `guild_user.GuildUser`

### 2.9.3 GetUsers (lista usersów w guildzie)

-   `GET /api/guilds/{guildId}/users?caller_id=4356534634563456`
-   response: `guild_user.GuildUserList`

```json
{
	"guildUsers": [
		{
			"guildUserId": "54674567",
			"nick": "Rafał",
			"roles": {
				"roles": [{ "guildRoleId": "2345235", "roleName": "Admin", "permissions": "READ|WRITE" }]
			}
		}
	]
}
```

### 2.9.4 PutGuildUser (nick + role assignment)

-   `PUT /api/guilds/{guildId}/users/{guildUserId}`
-   body (partial):

```json
{
	"caller_id": "4356534634563456",
	"user": {
		"guildUserId": "54674567",
		"nick": "Kuba",
		"roles": [{ "guildRoleId": "23452534-role-moderator", "roleName": "Moderator", "permissions": "READ|WRITE" }]
	}
}
```

-   response: `guild_user.GuildUser`

> Uwaga: trzymamy 1:1 z proto (`roles` jako lista list). Jeśli proto kiedyś uprościcie, w REST najlepiej przejść na `roleIds: string[]`.

### 2.9.5 DeleteGuildUser

-   `DELETE /api/guilds/{guildId}/users/{guildUserId}?caller_id=4356534634563456`
-   response: `common.ResponseMessage`

---

## 3) ChannelService

### 3.1 GetChannel

-   `GET /api/channels/{channelId}?caller_id=4356534634563456`
-   response: `channel.Channel`

### 3.2 PutChannel (name + overrides)

-   `PUT /api/channels/{channelId}`
-   body (partial):

```json
{
	"caller_id": "4356534634563456",
	"channel": {
		"name": "general",
		"overrides": {
			"roles": [{ "guildRoleId": "2345235", "roleName": "Admin", "permissions": "READ|WRITE|MANAGE_CHANNEL" }]
		}
	}
}
```

-   response: `channel.Channel`

### 3.3 DeleteChannel

-   `DELETE /api/channels/{channelId}?caller_id=4356534634563456`
-   response: `common.ResponseMessage`

---

## 3.4 Messages

### 3.4.1 GetMessages (offset/count)

-   `GET /api/channels/{channelId}/messages?caller_id=4356534634563456&offset=0&count=50`
-   response: `dmessage.MessageList`

```json
{
	"messages": [
		{
			"messageId": "m1",
			"author": { "guildUserId": "54674567", "nick": "Rafał", "roles": { "roles": [] } },
			"content": "Siemano",
			"timestamp": "2025-12-20T12:34:56.000Z"
		}
	]
}
```

### 3.4.2 CreateMessage

-   `POST /api/channels/{channelId}/messages`
-   body:

```json
{
	"caller_id": "4356534634563456",
	"message": { "content": "hejka" }
}
```

-   response: `dmessage.Message`

> W REST upraszczamy request vs proto (`{ req, message }` → `{ caller_id, message }`) i trzymamy camelCase.

### 3.4.3 DeleteMessage

-   `DELETE /api/channels/{channelId}/messages/{messageId}?caller_id=4356534634563456`
-   response: `common.ResponseMessage`

---

## 4) Greeter (opcjonalnie / healthcheck)

### 4.1 SayHello

-   `POST /api/hello`
-   body:

```json
{ "name": "Rafał" }
```

-   response:

```json
{ "message": "Hello Rafał" }
```

---

## 5) Zbiorcza lista (metoda + endpoint)

### Users

-   `POST /api/users`
-   `GET /api/users/{userId}?caller_id=...`
-   `PUT /api/users/{userId}`
-   `DELETE /api/users/{userId}?caller_id=...`

### Guilds

-   `POST /api/guilds`
-   `GET /api/guilds/{guildId}?caller_id=...`
-   `PUT /api/guilds/{guildId}`
-   `DELETE /api/guilds/{guildId}?caller_id=...`
-   `GET /api/users/{userId}/guilds?caller_id=...`
-   `GET /api/guilds/{guildId}/channels?caller_id=...`

### Roles

-   `GET /api/guilds/{guildId}/roles?caller_id=...`
-   `GET /api/guilds/{guildId}/roles/{guildRoleId}?caller_id=...`
-   `POST /api/guilds/{guildId}/roles`
-   `PUT /api/guilds/{guildId}/roles/{guildRoleId}`
-   `DELETE /api/guilds/{guildId}/roles/{guildRoleId}?caller_id=...` (opcjonalnie)

### Channels

-   `POST /api/guilds/{guildId}/channels`
-   `GET /api/channels/{channelId}?caller_id=...`
-   `PUT /api/channels/{channelId}`
-   `DELETE /api/channels/{channelId}?caller_id=...`

### Messages

-   `GET /api/channels/{channelId}/messages?caller_id=...&offset=...&count=...`
-   `POST /api/channels/{channelId}/messages`
-   `DELETE /api/channels/{channelId}/messages/{messageId}?caller_id=...`

### Guild users

-   `POST /api/guilds/{guildId}/users`
-   `GET /api/guilds/{guildId}/users?caller_id=...`
-   `GET /api/guilds/{guildId}/users/{guildUserId}?caller_id=...`
-   `PUT /api/guilds/{guildId}/users/{guildUserId}`
-   `DELETE /api/guilds/{guildId}/users/{guildUserId}?caller_id=...`

### Misc

-   `POST /api/hello`
