import {Client} from "pg";
import {hash} from "bcrypt";

import app from "../../app";

const SALT_ROUNDS = 10;

export interface IUser {
    id: number;
    org_id: number;
    email: string;
    password: string;
}

export async function addUser(email: string, password: string, org_id: number) {
    const addUserQuery = "INSERT INTO sponsors (org_id, email, password) VALUES ($1, $2, $3);";
    const passwordHash = await hash(password, SALT_ROUNDS);
    const postgresClient = new Client(app.get('config').databaseConnectionString);
    await postgresClient.connect();
    await postgresClient.query(addUserQuery, [org_id, email, passwordHash]);
    await postgresClient.end();
}

export async function getUserProfile(email: string): Promise<IUser> {
    const getUserQuery = "SELECT * FROM sponsors WHERE email = $1;";
    const postgresClient = new Client(app.get("config").databaseConnectionString);
    await postgresClient.connect();
    const result = await postgresClient.query(getUserQuery, [email]);
    await postgresClient.end();
    if (result.rowCount <= 0) {
        throw new Error("User does not exist.");
    }
    return result.rows[0] as IUser;
}
