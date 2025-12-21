CREATE DATABASE token_id_caller_id_mapping;

USE token_id_caller_id_mapping;

CREATE TABLE mapping (
     map_id BIGINT PRIMARY KEY,
     token_id VARCHAR(64) NOT NULL,
     caller_id BIGINT NOT NULL
);