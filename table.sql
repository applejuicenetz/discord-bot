CREATE TABLE IF NOT EXISTS aj_cores
(
    `user_id`    INT  NOT NULL UNIQUE,
    `token`      TEXT NOT NULL UNIQUE,
    `created_at` TEXT NOT NULL,
    `updated_at` TEXT NOT NULL,
    `payload`    TEXT NULL
);
