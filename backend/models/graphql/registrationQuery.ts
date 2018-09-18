import {GraphQLClient} from "graphql-request";

// Registration request parameters

export class RegistrationSearchUserRequest {
    queryTemplate: string = `
        query ($search: String!, $n: Int!, $offset: Int!) {
            search_user(search: $search, n: $n, offset: $offset, filter: {applied: true}) {
                total
                count
                offset
                users {
                    id
                }
            }
        }
    `;
    parameters: RegistrationSearchUserRequestParameters;

    constructor(parameters: RegistrationSearchUserRequestParameters) {
        this.parameters = parameters;
    }
}

export class RegistrationSearchUserRequestParameters {
    search: string;
    offset: number;
    n: number;

    constructor(search: string, offset: number, n: number) {
        this.search = search;
        this.offset = offset;
        this.n = n;
    }
}

// Registration Response model

export class RegistrationSearchUserResponse {
    total: number;
    count: number;
    offset: number;
    users: RegistrationUser[];
}

// Registration User Request Parameters

export class RegistrationGetUsersRequest {
    queryTemplate: string = `
        query ($n: Int!, $ids: [String], $pagination_token: ID) {
            users(n: $n, ids: $ids, pagination_token: $pagination_token, filter: {applied: true}) {
                id
                name 
                email 
                questions(names: ["github", "school", "resume"]) {
                    name
                    value
                    file {
                        path
                    }
                }
            }
        }
    `;
    parameters: RegistrationGetUsersRequestParameters;

    constructor(parameters: RegistrationGetUsersRequestParameters) {
        this.parameters = parameters;
    }
}

export class RegistrationGetUsersRequestParameters {
    pagination_token: string;
    n: number;
    ids: string[];

    constructor(pagination_token: string, n: number, ids: string[]) {
        this.pagination_token = pagination_token;
        this.n = n;
        this.ids = ids;
    }
}

export class RegistrationGetUsersResponse {
    users: RegistrationUser[];
}

export class RegistrationUser {
    id: string;
    name?: string;
    email?: string;
    questions?: Question[];
    pagination_token?: string;
}

class Question {
    type?: string;
    value?: string;
    file?: File;
}

class File {
    path?: string;
}

export async function userSearchRegistration(endpoint: string, adminToken: string, request: RegistrationSearchUserRequest): Promise<string[]> {
    const userIds: string[] = [];
    const client = new GraphQLClient(endpoint, { headers: {Authorization: "Basic " + adminToken}});
    let response: RegistrationSearchUserResponse
        = ((await client.request(request.queryTemplate, request.parameters) as any).search_user) as RegistrationSearchUserResponse;
    console.log(JSON.stringify(response));
    let total = response.count;
    for (let x = 0; x < response.count; x++) {
        userIds.push(response.users[x].id);
    }
    while (total < response.total) {
        request.parameters.offset += response.count;
        response = (await client.request(request.queryTemplate, request.parameters) as any).search_user as RegistrationSearchUserResponse;
        for (let x = 0; x < response.count; x++) {
            userIds.push(response.users[x].id);
        }
        total += response.count;
    }
    return userIds;
}

export async function registrationGetUsers(endpoint: string, adminToken: string, request: RegistrationGetUsersRequest): Promise<RegistrationGetUsersResponse> {
    const client = new GraphQLClient(endpoint, { headers: {Authorization: "Basic " + adminToken}});
    return (await client.request(request.queryTemplate, request.parameters) as any) as RegistrationGetUsersResponse;
}