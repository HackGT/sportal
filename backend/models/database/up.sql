CREATE TABLE IF NOT EXISTS sponsor (
    name text PRIMARY KEY,
    logo_url text NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    sponsor_name text REFERENCES sponsor(name)
);
