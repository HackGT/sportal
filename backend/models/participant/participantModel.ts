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

export async function searchToken(databaseConnectionString: string, queryStr: string) {
    // process token to comply with to_tsquery
    const tokens = queryStr.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
    const tsquery = tokens.join(' | ');

    // perform full-text search
    const ftsQuery = "SELECT * FROM participant WHERE document @@ to_tsquery('$1');";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    const result = await db.query(ftsQuery, [tsquery]);
    await postgresClient.end();
    if (result.rowCount <= 0) {
        return [];
    }
    return result.rows as Participant[];
}

export async function searchByIds(databaseConnectionString: string, ids: string[]): Promise<Participant[]> {
    
    const idQuery = "SELECT registration_id, tags, blob FROM participant WHERE registration_id = $1;";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    const participants: Participant[] = [];
    for (let i: number = 0; i < ids.length; i++) {
        const result = await db.query(idQuery, [ids[i]]);
        const blob = result.rows[0].blob;
        blob.tags = result.rows[0].tags;
        participants.push(blob as Participant);
    }
    await postgresClient.end();
    return participants;
}

export async function searchByTag(databaseConnectionString: string, user_id: string, tag: string): Promise<Participant[]> {
    
    const tagQuery = "SELECT registration_id, tags, blob FROM participant WHERE tags -> '$1:alias' ? '$2:alias';";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    const result = await db.query(tagQuery, [user_id, tag]);
    await postgresClient.end();
    const blob = result.rows;
    for (let i: number = 0; i < result.rowCount; i++) {
        blob[i].blob.tags = blob[i].tags[user_id];
    }
    return blob as Participant[];
}

export async function tagParticipant(databaseConnectionString: string, user_id: string, registration_id: string, tag: string) {
    const tagQuery = "UPDATE testing SET tags = CASE when tags ? '$1' then jsonb_insert(jsb, '{$1, 0}', '$2') else jsonb_set(jsb, '{$1}', '[$2]') END WHERE id = $3;";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    await db.query(tagQuery, [user_id, tag, registration_id]);
    await postgresClient.end();
}

export async function untagParticipant(databaseConnectionString: string, user_id: string, registration_id: string, tag: string) {
    const tagQuery = "UPDATE testing SET tags = jsonb_set(tags, '{$1}', (jsb->'$1:alias')::jsonb - '$2:alias') WHERE id = $3;";
    const postgresClient = pgp();
    const db = postgresClient(databaseConnectionString);
    await db.query(tagQuery, [user_id, tag, registration_id]);
    await postgresClient.end();
}