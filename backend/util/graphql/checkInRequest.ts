import {GraphQLClient} from "graphql-request";

class CheckInRequestParameters {
    registration_id: string;
    sponsor: string;

    constructor(registration_id: string, sponsor: string) {
        this.registration_id = registration_id;
        this.sponsor = sponsor;
    }
}

interface IUser {
    id: string;
}

interface ITagCarrier {
    tag: ITag;
}

interface ITag {
    name: string;
}

interface CheckInResponse {
    user: IUser;
    tags: ITagCarrier[];
}

export async function checkInUserWithSponsor(apiKey: string, endpoint: string, registration_id: string, sponsor: string): Promise<CheckInResponse> {
    const query = `
        mutation ($registration_id: ID!, $sponsor: String!) {
            check_in(user: $registration_id, tag: $sponsor) {
                user {
                    id
                }
                tags {
                    tag {
                    name
                    }
                }
            }
        }
    `
    const client = new GraphQLClient(endpoint, {headers: {Authorization: "Basic " + apiKey}});
    const ret = (await client.request(query, new CheckInRequestParameters(registration_id, sponsor)) as any).check_in as CheckInResponse;
    return ret;
}
