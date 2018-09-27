import {Router} from "express";

import {
    RegistrationSearchUserRequestParameters,
    RegistrationSearchUserRequest,
    RegistrationGetUsersRequestParameters,
    RegistrationGetUsersRequest,
    RegistrationUser,
    userSearchRegistration,
    registrationGetUsers,
} from "../../models/util/graphql/registrationQuery";
import {ResponseCodes} from "../../models/util/response/responseCodes";
import { Participant } from "../../models/participant/participantModel";

export class SearchRequest {
    public search: string;
    public n: number;
    public paginationToken: string;
}

export class SearchResponse {
    public users: Participant[];

    constructor(users: Participant[]) {
        this.users = users;
    }
}

export const router = Router();

router.post("/", async (req, res, next) => {
    const searchBody = req.body as SearchRequest;
    if (!searchBody || !searchBody.search || !searchBody.n) {
        res.status(ResponseCodes.ERROR_BAD_REQUEST)
        next(new Error("Request missing search parameters"));
        return;
    }
    try {
        // Query registration for user list
        const searchParams = new RegistrationSearchUserRequestParameters(
            searchBody.search,
            0,
            req.app.get("config").graphqlInternalPaginationN
        );
        const ids = await userSearchRegistration(req.app.get("config").graphqlRegistrationEndpoint,
            req.app.get("config").graphqlRegistrationApiKey, new RegistrationSearchUserRequest(searchParams));

            
        // Get actual user objects
        const getParams = new RegistrationGetUsersRequestParameters(searchBody.paginationToken, searchBody.n, ids);
        const userList = await registrationGetUsers(req.app.get("config").graphqlRegistrationEndpoint, req.app.get("config").graphqlRegistrationApiKey, new RegistrationGetUsersRequest(getParams));
        const searchResponse = new SearchResponse(userList.users);
        res.status(ResponseCodes.SUCCESS);
        req.returnObject = searchResponse;
        req.routed = true;
        next();
    } catch (err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        req.routed = true;
        next(err);
    }
});

export default router;
