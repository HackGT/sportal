CREATE TABLE IF NOT EXISTS sponsors (
    id serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password text NOT NULL
);