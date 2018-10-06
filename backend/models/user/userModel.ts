import {Client} from "pg";
import {hash} from "bcryptjs";

const SALT_ROUNDS = 10;

export interface IUser {
    id: number;
    email: string;
    password: string;
}

export async function addUser(databaseConnectionString: string, email: string, password: string) {
    const addUserQuery = "INSERT INTO sponsors (email, password) VALUES ($1, $2);";
    const passwordHash = await hash(password, SALT_ROUNDS);
    const postgresClient = new Client(databaseConnectionString);
    await postgresClient.connect();
    await postgresClient.query(addUserQuery, [email, passwordHash]);
    await postgresClient.end();
}

export async function getUserProfile(databaseConnectionString: string, email: string): Promise<IUser> {
    const getUserQuery = "SELECT * FROM sponsors WHERE email = $1;";
    const postgresClient = new Client(databaseConnectionString);
    await postgresClient.connect();
    const result = await postgresClient.query(getUserQuery, [email]);
    await postgresClient.end();
    if (result.rowCount <= 0) {
        throw new Error("User does not exist.");
    }
    return result.rows[0] as IUser;
}
