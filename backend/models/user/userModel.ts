import * as pgp from "pg-promise";
import {hash} from "bcryptjs";

const SALT_ROUNDS = 10;

export interface IUser {
    id: number;
    email: string;
    password: string;
    sponsor_name: string;
}

export async function addUser(db: pgp.IDatabase<{}>, email: string, password: string, sponsorName: string) {
    const addUserQuery = "INSERT INTO users (email, password, sponsor_name) VALUES ($1, $2, $3);";
    const passwordHash = await hash(password, SALT_ROUNDS);
    await db.query(addUserQuery, [email, passwordHash, sponsorName]);
}

export async function getUserProfile(db: pgp.IDatabase<{}>, email: string): Promise<IUser> {
    const getUserQuery = "SELECT * FROM users WHERE email = $1 LIMIT 1;";
    const result = await db.query(getUserQuery, [email]);
    if (result.rowCount <= 0) {
        throw new Error("User does not exist.");
    }
    return result[0] as IUser;
}

