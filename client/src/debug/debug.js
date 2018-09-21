import {
    ACTION_USER_LOGIN,
    ACTION_PARTICIPANTS_LOAD
} from "../constants/actions";

const DebugHelper = {};

/**
 * Initialize DebugHelper
 * @param {*} store redux store of the app
 */
DebugHelper.init = (store) => {
    DebugHelper.store = store;
}

DebugHelper.login = () => {
    DebugHelper.populateSampleParticipants();
    DebugHelper.store.dispatch({
        type: ACTION_USER_LOGIN,
        payload: {
            username: 'Debug Session',
            token: ''
        }
    })
}

DebugHelper.populateSampleParticipants = () => {
    DebugHelper.store.dispatch({
        type: ACTION_PARTICIPANTS_LOAD,
        payload: {
            list: [
                {
                    id: "11111111111",
                    name: "Siwei Li",
                    email: "robertsiweili@gatech.edu",
                    hasStar: true,
                },
                {
                    id: "11111111112",
                    name: "Anish",
                    email: "anish.visaria@gatech.edu",
                    hasStar: false,
                },
                {
                    id: "11111111113",
                    name: "Dennis",
                    email: "dennis@gatech.edu",
                    hasStar: false,
                },
            ]
        }
    })
}

export default DebugHelper;