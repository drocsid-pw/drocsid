CREATE KEYSPACE IF NOT EXISTS drocsid
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE drocsid;

CREATE TABLE IF NOT EXISTS users (
    user_id bigint PRIMARY KEY,
    email   text,
    name    text
);

CREATE TABLE IF NOT EXISTS guilds (
    guild_id bigint PRIMARY KEY,
    owner_id bigint,
    name     text
);

CREATE TABLE IF NOT EXISTS guild_users (
    guild_user_id   bigint PRIMARY KEY,
    guild_id        bigint,
    user_id         bigint,
    nick            text
);

CREATE TABLE IF NOT EXISTS roles (
    role_id             bigint PRIMARY KEY,
    name                text,
    position            smallint,
    read_permission     boolean,
    write_perm          boolean,
    guild_edit_perm     boolean,
    channel_edit_perm   boolean,
    user_edit_perm      boolean,
    message_del_perm    boolean
);

CREATE TABLE IF NOT EXISTS guild_user_roles (
    guild_user_role_id  bigint PRIMARY KEY,
    guild_user_id       bigint,
    role_id             bigint
);

CREATE TABLE IF NOT EXISTS channels (
    channel_id bigint PRIMARY KEY,
    guild_id   bigint,
    name       text
);

CREATE TABLE IF NOT EXISTS channel_overrides (
    channel_override_id bigint PRIMARY KEY,
    channel_id          bigint,
    role_id             bigint,
    read_permission     boolean,
    write_perm          boolean,
    channel_edit_perm   boolean,
    message_del_perm    boolean
);

CREATE TABLE IF NOT EXISTS messages (
    channel_id bigint,
    bucket     int,
    message_id bigint,
    guild_id   bigint,
    author_id  bigint,
    content    text,
    PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id ASC);

