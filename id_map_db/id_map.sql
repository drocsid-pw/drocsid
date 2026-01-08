CREATE DATABASE IF NOT EXISTS token_id_caller_id_mapping;

USE token_id_caller_id_mapping;

CREATE TABLE IF NOT EXISTS mapping (
    map_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token_id VARCHAR(64) NOT NULL,
    caller_id BIGINT NOT NULL
    );