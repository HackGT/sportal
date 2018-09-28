import { Client } from "pg";

export class RegistrationUser {
    id: string;
    name?: string;
    email?: string;
    questions?: Question[];
}

class Question {
    name?: string;
    value?: string;
    file?: File;
}

class File {
    path?: string;
}

export class Participant extends RegistrationUser {
    tags: string[];
}

export async function searchToken(databaseConnectionString: string, query: string) {
    // process token to comply with to_tsquery
    const tokens = query.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
    const tsquery = tokens.join(' | ');

    // perform full-text search
    const ftsQuery = "SELECT * FROM participant WHERE document @@ to_tsquery('$1');";
    const postgresClient = new Client(databaseConnectionString);
    await postgresClient.connect();
    const result = await postgresClient.query(ftsQuery, [tsquery]);
    await postgresClient.end();
    if (result.rowCount <= 0) {
        return [];
    }
    return result.rows as Participant[];
}

export async function searchByIds(databaseConnectionString: string, ids: string[]): Promise<Participant[]> {
    
    const idQuery = "SELECT registration_id, tags, blob FROM participant WHERE registration_id = $1;";
    const postgresClient = new Client(databaseConnectionString);
    await postgresClient.connect();
    const participants: Participant[] = [];
    for (let i: number = 0; i < ids.length; i++) {
        const result = await postgresClient.query(idQuery, [ids[i]]);
        const blob = result.rows[0].blob;
        blob.tags = result.rows[0].tags;
        participants.push(blob as Participant);
    }
    await postgresClient.end();
    return participants;
}

export async function searchByTag(databaseConnectionString: string, tag: string): Promise<Participant[]> {
    
    const tagQuery = "SELECT registration_id, tags, blob FROM participant WHERE registration_id LIKE $1;";
    const postgresClient = new Client(databaseConnectionString);
    await postgresClient.connect();
    const result = await postgresClient.query(tagQuery, ["%" + tag + "%"]);
    await postgresClient.end();
    const blob = result.rows;
    for (let i: number = 0; i < result.rowCount; i++) {
        blob[i].blob.tags = blob[i].tags;
    }
    return blob as Participant[];
}

export async function tagParticipant(databaseConnectionString: string, registration_id: string, tag: string) {
    const tagQuery = "UPDATE participant SET tags = array_append(tags, $1) WHERE registration_id = $2;";
    const postgresClient = new Client(databaseConnectionString);
    await postgresClient.connect();
    await postgresClient.query(tagQuery, [tag, registration_id]);
    await postgresClient.end();
}

export async function untagParticipant(databaseConnectionString: string, registration_id: string, tag: string) {
    const tagQuery = "UPDATE participant SET tags = array_remove(tags, $1) WHERE registration_id = $2;";
    const postgresClient = new Client(databaseConnectionString);
    await postgresClient.connect();
    await postgresClient.query(tagQuery, [tag, registration_id]);
    await postgresClient.end();
}