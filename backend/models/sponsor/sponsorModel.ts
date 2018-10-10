import * as pgp from "pg-promise";

interface ISponsor {
    name: string;
    logo_url: string;
}


export async function getSponsorProfileByName(db: pgp.IDatabase<{}>, sponsorName: string): Promise<ISponsor> {
    const getSponsorQuery = "SELECT * FROM sponsor WHERE name = $1 LIMIT 1;";
    const result = await db.query(getSponsorQuery, [sponsorName]);
    if (result.rowCount <= 0) {
        throw new Error("Sponsor does not exist.");
    }
    return result[0] as ISponsor;
}