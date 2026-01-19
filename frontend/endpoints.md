# Drocsid REST API (spring_grpc)

Wersja: na podstawie `spring_grpc/src/main/java/com/drocsid/grpc/http/controller/*`

## Auth

- Wszystkie endpointy (poza `/api/hello`) wymagają nagłówka:
  - `Authorization: Bearer <google_id_token>` (albo token bez prefixu, backend i tak obcina `Bearer `)
- Query param `caller_id` widoczny w frontendzie NIE jest używany przez controllery (jest ignorowany).
- Backend mapuje: token subject -> `mapping.token_id` -> `mapping.caller_id` (BigInteger) i dopiero to leci do core przez gRPC.

---

## Guilds

### POST `/api/guilds`
Tworzy serwer (guild).

Body:
```json
{ "name": "My guild", "icon": "" }
````

Response: `GuildDto`

```json
{ "guildId": "...", "name": "...", "icon": "", "ownerId": "...", "roles": [] }
```

---

### GET `/api/guilds/{guildId}`

Pobiera serwer.

Response: `GuildDto`

---

### PUT `/api/guilds/{guildId}`

Aktualizuje serwer (name/icon/ownerId/roles w payloadzie, ale w praktyce role zwykle osobno endpointami ról).

Body:

```json
{
  "guild": {
    "guildId": "145...",
    "name": "ns6",
    "icon": "",
    "ownerId": "145...",
    "roles": [
      { "guildRoleId": "1", "roleName": "@everyone", "permissions": "..." }
    ]
  }
}
```

Response: `GuildDto`

---

### DELETE `/api/guilds/{guildId}`

Usuwa serwer.

Response: `ResponseMessageDto`

```json
{ "text": "Guild deleted successfully." }
```

---

## Guild Channels (lista i tworzenie)

### GET `/api/guilds/{guildId}/channels`

Lista kanałów w guildzie.

Response: `ChannelListDto`

```json
{ "channels": [ { "channelId": "...", "name": "general", "guildId": "...", "overrides": { "roles": [] } } ] }
```

---

### POST `/api/guilds/{guildId}/channels`

Tworzy kanał w guildzie. To jest poprawny endpoint do “Add channel”.

Body:

```json
{ "name": "qweqwe" }
```

Response: `ChannelDto` (z PRAWDZIWYM `channelId` generowanym w core)

```json
{ "channelId": "145...", "name": "qweqwe", "guildId": "145...", "overrides": { "roles": [] } }
```

**Ważne:** Front powinien po tym podmienić `tmp-*` na realne `channelId`.

---

## Roles (w ramach guilda)

### GET `/api/guilds/{guildId}/roles`

Lista ról.

Response: `RoleListDto`

```json
{ "roles": [ { "guildRoleId": "...", "roleName": "...", "permissions": "..." } ] }
```

---

### GET `/api/guilds/{guildId}/roles/{guildRoleId}`

Pobiera jedną rolę.

Response: `RoleDto`

---

### POST `/api/guilds/{guildId}/roles`

Tworzy rolę.

Body:

```json
{ "roleName": "moderator", "permissions": "READ_MESSAGES,SEND_MESSAGES" }
```

Response: `RoleDto`

---

### PUT `/api/guilds/{guildId}/roles/{guildRoleId}`

Aktualizuje rolę.

Body:

```json
{ "role": { "guildRoleId": "...", "roleName": "mod", "permissions": "..." } }
```

Response: `RoleDto`

---

### DELETE `/api/guilds/{guildId}/roles/{guildRoleId}`

Niezaimplementowane (zwraca UNIMPLEMENTED).

---

## Guild Users (members)

### POST `/api/guilds/{guildId}/users`

Dodaje aktualnie zalogowanego usera do guilda.

Response: `GuildUserDto`

---

### GET `/api/guilds/{guildId}/users`

Lista guild userów.

Response: `GuildUserListDto`

```json
{ "guildUsers": [ { "guildUserId": "...", "nick": "...", "roles": { "roles": [] } } ] }
```

---

### GET `/api/guilds/{guildId}/users/{guildUserId}`

Pobiera guild usera.

Response: `GuildUserDto`

---

### PUT `/api/guilds/{guildId}/users/{guildUserId}`

Aktualizuje guild usera (nick + roles).

Body:

```json
{
  "user": {
    "guildUserId": "145...",
    "nick": "Rafal",
    "roles": { "roles": [ { "guildRoleId": "...", "roleName": "...", "permissions": "..." } ] }
  }
}
```

Uwaga: backend akceptuje też `roles` jako tablicę albo `{ "roles": [ ... ] }`.

Response: `GuildUserDto`

---

### DELETE `/api/guilds/{guildId}/users/{guildUserId}`

Usuwa guild usera.

Response: `ResponseMessageDto`

---

## Channels (operacje na konkretnym kanale)

### GET `/api/channels/{channelId}`

Pobiera kanał.

Response: `ChannelDto`

---

### PUT `/api/channels/{channelId}`

Aktualizuje kanał (nazwa + overrides).
To NIE jest endpoint do tworzenia.

Body:

```json
{
  "channel": {
    "name": "general",
    "guildId": "145...",
    "overrides": {
      "roles": [
        { "guildRoleId": "...", "roleName": "...", "permissions": "..." }
      ]
    }
  }
}
```

Response: `ChannelDto`

---

### DELETE `/api/channels/{channelId}`

Usuwa kanał.

Response: `ResponseMessageDto`

---

## Channel Messages

### GET `/api/channels/{channelId}/messages?offset=0&count=50`

Pobiera wiadomości (paginacja offset/count).

Response: `MessageListDto`

```json
{ "messages": [ { "messageId": "...", "author": { ... }, "content": "..." } ] }
```

---

### POST `/api/channels/{channelId}/messages`

Tworzy wiadomość.

Body:

```json
{ "message": { "content": "hello" } }
```

Response: `MessageDto`

---

### DELETE `/api/channels/{channelId}/messages/{messageId}`

Usuwa wiadomość.

Response: `ResponseMessageDto`

---

## Users (global)

### GET `/api/users/get_user`

Zwraca usera dla aktualnego tokena; jeśli nie istnieje w core, backend go tworzy.

Response: `UserDto`

```json
{ "id": "...", "name": "...", "avatarHash": null }
```

---

### GET `/api/users/{userId}/guilds`

Zwraca listę guildów usera.
Uwaga: `userId` w path musi być równy authedUserId (token subject), inaczej FORBIDDEN.

Response: `GuildListDto`

---

### PUT `/api/users/{userId}`

Aktualizuje usera (name/avatarHash).
Uwaga: `userId` w path musi być równy authedUserId (token subject), inaczej FORBIDDEN.

Body:

```json
{ "name": "Rafal", "avatarHash": "..." }
```

Response: `UserDto`

---

### DELETE `/api/users/{userId}`

Usuwa usera (jak wyżej: path userId musi matchować token subject).

Response: `ResponseMessageDto`

---

## Media

### POST `/api/media/uploadImage`

Upload obrazka przez mediaproxy (Base64 w polu `file`).

Body:

```json
{ "file": "<base64>", "filename": "avatar.png" }
```

Response: `MediaDto`

```json
{ "message": "...", "url": "..." }
```

---

## Misc

### POST `/api/hello`

Demo endpoint (bez auth).

Body:

```json
{ "name": "World" }
```

Response:

```json
{ "message": "Hello World" }
```
