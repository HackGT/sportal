import * as pgp from "pg-promise";

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

export class ReturnedTagObject {
    tags: string[];
    constructor(tags: string[]) {
        this.tags = tags;
    }
}

export async function searchToken(databaseConnectionString: string, queryStr: string) {
    // process token to comply with to_tsquery
    const tokens = queryStr.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
    const tsquery = tokens.join(' | ');

    // perform full-text search
    const ftsQuery = "SELECT registration_id, tags, blob FROM participant WHERE document @@ to_tsquery($1);";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    const result = await db.query(ftsQuery, [tsquery]);
    await postgresClient.end();
    return result as Participant[];
}

export async function searchByIds(databaseConnectionString: string, ids: string[]): Promise<Participant[]> {
    const idQuery = "SELECT registration_id, tags, blob FROM participant WHERE registration_id = $1;";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    const participants: Participant[] = [];
    for (let i: number = 0; i < ids.length; i++) {
        const result = await db.query(idQuery, [ids[i]]);
        const blob = result[0].blob;
        blob.tags = result[0].tags;
        participants.push(blob as Participant);
    }
    await postgresClient.end();
    return participants;
}

export async function searchByTag(databaseConnectionString: string, user_id: string, tag: string): Promise<Participant[]> {
    
    const tagQuery = "SELECT registration_id, tags -> $1 AS tags, blob FROM participant WHERE tags -> $1 ? $2;";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    const result = await db.query(tagQuery, [user_id, tag]);
    await postgresClient.end();
    const participants: Participant[] = [];
    for (let i: number = 0; i < result.length; i++) {
        result[i].blob.tags = result[i].tags[user_id];
        participants.push(result[i].blob);
    }
    return participants as Participant[];
}

export async function tagParticipant(databaseConnectionString: string, user_id: string, registration_id: string, tag: string): Promise<ReturnedTagObject> {
    const tagQuery = "UPDATE participant SET tags = CASE when tags ? $1 then jsonb_insert(tags, '{$1:name, 0}', '$2:name') else jsonb_set(tags, '{$1:name}', '[$2:name]') END WHERE registration_id = $3 RETURNING tags -> $1 AS tags;";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    const result = await db.query(tagQuery, [user_id, tag, registration_id]);
    await postgresClient.end();
    return new ReturnedTagObject(result[0].tags);
}

export async function untagParticipant(databaseConnectionString: string, user_id: string, registration_id: string, tag: string): Promise<ReturnedTagObject> {
    const tagQuery = "UPDATE participant SET tags = jsonb_set(tags, $1, (tags->$2)::jsonb - $3) WHERE registration_id = $4 RETURNING tags -> $2 AS tags;";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    const result = await db.query(tagQuery, ["{" + user_id + "}", user_id, tag, registration_id]);
    await postgresClient.end();
    return new ReturnedTagObject(result[0].tags);
}