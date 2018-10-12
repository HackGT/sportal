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

export async function getAllParticipants(db: pgp.IDatabase<{}>, sponsor_name: string): Promise<Participant[]> {
    const getAllQuery = "SELECT tags -> $1 as tags, blob FROM participant WHERE opted_in = true;";
    const result = await db.query(getAllQuery, [sponsor_name]);
    const participants: Participant[] = [];
    for (let i: number = 0; i < result.length; i++) {
        if (result[i].tags) {
            result[i].blob.tags = result[i].tags;
        } else {
            result[i].blob.tags = [];
        }
        participants.push(result[i].blob);
    }
    return participants;
}

export async function searchToken(db: pgp.IDatabase<{}>, user_id: string, queryStr: string): Promise<Participant[]> {
    // process token to comply with to_tsquery
    const tokens = queryStr.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
    const tsqueryOR = tokens.join(' | ');
    const tsqueryAND = tokens.join(' & ');
    const tsqueryPROX = tokens.join(' <-> ');

    // perform full-text search
    const ftsQuery = `
    SELECT tags -> $1 as tags, blob 
    FROM participant 
    WHERE document @@ to_tsquery($2) AND opted_in = true
    ORDER BY CASE WHEN document @@ to_tsquery($3) THEN 0 END,
            CASE WHEN document @@ to_tsquery($4) THEN 1 ELSE 999 END;
    `
    
    const result = await db.query(ftsQuery, [user_id, tsqueryOR, tsqueryPROX, tsqueryAND]);
    const participants: Participant[] = [];
    for (let i: number = 0; i < result.length; i++) {
        if (result[i].tags) {
            result[i].blob.tags = result[i].tags;
        } else {
            result[i].blob.tags = [];
        }
        participants.push(result[i].blob);
    }
    return participants;
}

export async function searchByIds(db: pgp.IDatabase<{}>, sponsor_name: string, ids: string[]): Promise<Participant[]> {
    const idQuery = "SELECT tags -> $1 as tags, blob FROM participant WHERE registration_id = $2 AND opted_in = true;";
    const participants: Participant[] = [];
    for (let i: number = 0; i < ids.length; i++) {
        const result = await db.query(idQuery, [sponsor_name, ids[i]]);
        const blob = result[0].blob;
        if (result[0].tags) {
            blob.tags = result[0].tags;
        } else {
            blob.tags = [];
        }
        participants.push(blob as Participant);
    }
    return participants;
}

export async function searchByTag(db: pgp.IDatabase<{}>, sponsor_name: string, tag: string): Promise<Participant[]> {
    const tagQuery = "SELECT tags -> $1 AS tags, blob FROM participant WHERE tags -> $1 ? $2 AND opted_in = true;";
    const result = await db.query(tagQuery, [sponsor_name, tag]);
    const participants: Participant[] = [];
    for (let i: number = 0; i < result.length; i++) {
        if (result[i].tags) {
            result[i].blob.tags = result[i].tags;
        } else {
            result[i].blob.tags = [];
        }
        participants.push(result[i].blob);
    }
    return participants as Participant[];
}

export async function tagParticipant(db: pgp.IDatabase<{}>, sponsor_name: string, registration_id: string, tag: string): Promise<ReturnedTagObject> {
    const tagQuery = "UPDATE participant SET tags = CASE when tags ? $1 then jsonb_insert(tags, '{$1:name, 0}', '$2:name') else jsonb_set(tags, '{$1:name}', '[$2:name]') END WHERE registration_id = $3 RETURNING tags -> $1 AS tags;";
    const result = await db.query(tagQuery, [sponsor_name, tag, registration_id]);
    return new ReturnedTagObject(result[0].tags);
}

export async function untagParticipant(db: pgp.IDatabase<{}>, sponsor_name: string, registration_id: string, tag: string): Promise<ReturnedTagObject> {
    const tagQuery = "UPDATE participant SET tags = jsonb_set(tags, $1, (tags->$2)::jsonb - $3) WHERE registration_id = $4 AND opted_in = true RETURNING tags -> $2 AS tags;";
    const result = await db.query(tagQuery, ["{" + sponsor_name + "}", sponsor_name, tag, registration_id]);
    return new ReturnedTagObject(result[0].tags);
}

export async function setParticipantOptedIn(db: pgp.IDatabase<{}>, registration_id: string, opted_in: boolean) {
    const optedInQuery = "UPDATE participant SET opted_in = $1 WHERE registration_id = $2;";
    await db.query(optedInQuery, [opted_in, registration_id]);
}

export async function getParticipantResumeKey(db: pgp.IDatabase<{}>, registration_id: string): Promise<string> {
    const getParticipantResumeQuery = "SELECT resume_key FROM participant WHERE registration_id = $1 AND opted_in = true LIMIT 1;";
    const result = await db.query(getParticipantResumeQuery, [registration_id]);
    return result[0].resume_key;
}