import {Router} from "express";

import {
    RegistrationSearchUserRequestParameters,
    RegistrationSearchUserRequest,
    RegistrationGetUsersRequestParameters,
    RegistrationGetUsersRequest,
    RegistrationUser,
    userSearchRegistration,
    registrationGetUsers,
} from "../models/graphql/registrationQuery";
import ResponseCodes from "../models/response/responseCodes";

export class SearchRequest {
    public search: string;
    public n: number;
    public pagination_token: string;
}

export class SearchResponse {
    public users: RegistrationUser[];

    constructor(users: RegistrationUser[]) {
        this.users = users;
    }
}

export const router = Router();

router.post("/", async (req, res, next) => {
    try {
        // Query registration for user list
        const searchBody = req.body as SearchRequest;
        const searchParams = new RegistrationSearchUserRequestParameters(
            searchBody.search,
            0,
            req.app.get("config").graphqlInternalPaginationN
        );
        const ids = await userSearchRegistration(req.app.get("config").graphqlRegistrationEndpoint,
            req.app.get("config").graphqlRegistrationApiKey, new RegistrationSearchUserRequest(searchParams));
        
        // Get actual user objects
        const getParams = new RegistrationGetUsersRequestParameters(searchBody.pagination_token, searchBody.n, ids);
        const userList = await registrationGetUsers(req.app.get("config").graphqlRegistrationEndpoint, req.app.get("config").graphqlRegistrationApiKey, new RegistrationGetUsersRequest(getParams));
        const searchResponse = new SearchResponse(userList.users);
        res.status(ResponseCodes.SUCCESS);
        req.returnObject = searchResponse;
        next();
    } catch (err) {
        next(err);
    }
});

export default router;
