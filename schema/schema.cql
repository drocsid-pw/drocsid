CREATE TABLE users (
    user_id bigint PRIMARY KEY,
    email   text,
    nickname   text
);

CREATE TABLE guilds (
    guild_id bigint PRIMARY KEY,
    owner_id bigint,
    name     text
);

CREATE TABLE channels (
    channel_id bigint PRIMARY KEY,
    guild_id   bigint,
    name       text
);

CREATE TABLE messages (
    channel_id bigint,
    bucket     int,
    message_id bigint,
    guild_id   bigint,
    author_id  bigint,
    content    text,
    PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id ASC);

