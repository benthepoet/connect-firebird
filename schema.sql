CREATE TABLE session (
    sid VARCHAR(255) NOT NULL PRIMARY KEY,
    session BLOB SUB_TYPE TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);