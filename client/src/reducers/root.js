import { combineReducers } from 'redux';
import { 
    ACTION_UI_SEARCH_STRING, 
    ACTION_UI_SELECT_PARTICIPANT_ID, 
    ACTION_PARTICIPANTS_LOAD_BEGIN, 
    ACTION_PARTICIPANTS_LOAD_END, 
    ACTION_PARTICIPANTS_LOAD, 
    ACTION_USER_LOGIN, 
    ACTION_USER_LOGOUT, 
    ACTION_UI_ERROR_SHOW, 
    ACTION_UI_ERROR_HIDE,
    ACTION_UI_GLOBAL_LOADER_SHOW, 
    ACTION_UI_GLOBAL_LOADER_HIDE, 
    ACTION_PARTICIPANTS_STAR_ADD,
    ACTION_PARTICIPANTS_STAR_REMOVE,
    ACTION_USER_RENEW_TOKEN,
    ACTION_UI_CHANGE_VIEW_MODE,
    ACTION_PARTICIPANTS_CHANGE_PAGE,
    ACTION_UI_DOWNLOAD_HIDE,
    ACTION_UI_DOWNLOAD_SHOW
} from '../constants/actions';

const initialState = {
    ui: {
        viewMode: 'all', // 'all', 'star', 'visit', 'search'
        searchTerm: '',
        selectedParticipantID: '',
        selectedParticipantResumeURL: '',
        selectedParticipantResumeType: '',
        isErrorModalActive: false,
        errorModalMessage: '',
        isDownloadModalActive: false,
        downloadURL: '',
        isGlobalLoaderActive: false,
    },
    user: {
        isLoggedIn: false,
        username: '',
        token: ''
    },
    participants: {
        isLoading: false,
        page: 1,
        list: [],
    }
};

const ui = (state = initialState.ui, action) => {
    switch (action.type) {
        case ACTION_UI_CHANGE_VIEW_MODE:
            return Object.assign({}, state, {
                viewMode: action.payload.viewMode
            })
        case ACTION_UI_ERROR_SHOW:
            return Object.assign({}, state, {
                isErrorModalActive: true,
                errorModalMessage: action.payload.message
            });
        case ACTION_UI_ERROR_HIDE:
            return Object.assign({}, state, {
                isErrorModalActive: false,
                errorModalMessage: ''
            });
        case ACTION_UI_SEARCH_STRING:
            return Object.assign({}, state, {
                searchTerm: action.payload.searchTerm
            });
        case ACTION_UI_SELECT_PARTICIPANT_ID:
            return Object.assign({}, state, {
                selectedParticipantID: action.payload.id,
                selectedParticipantResumeType: action.payload.resumeType,
                selectedParticipantResumeURL: action.payload.url,
            });
        case ACTION_UI_GLOBAL_LOADER_SHOW:
            return Object.assign({}, state, {
                isGlobalLoaderActive: true
            });
        case ACTION_UI_GLOBAL_LOADER_HIDE:
            return Object.assign({}, state, {
                isGlobalLoaderActive: false,
            });
        case ACTION_UI_DOWNLOAD_SHOW:
            return Object.assign({}, state, {
                isDownloadModalActive: true,
                downloadURL: action.payload.downloadURL,
            });
        case ACTION_UI_DOWNLOAD_HIDE:
            return Object.assign({}, state, {
                isDownloadModalActive: false,
            });
        default:
            return state;
    }
};

const participants = (state = initialState.participants, action) => {
    switch (action.type) {
        case ACTION_PARTICIPANTS_LOAD_BEGIN:
            return Object.assign({}, state, { isLoading: true });
        case ACTION_PARTICIPANTS_LOAD_END:
            return Object.assign({}, state, { isLoading: false });
        case ACTION_PARTICIPANTS_LOAD:
            return Object.assign({}, state, {
                list: action.payload.list,
                page: 1
            });
        case ACTION_PARTICIPANTS_STAR_ADD:
            return Object.assign({}, state, {
                list: state.list.map(participant => Object.assign({}, participant, {
                    hasStar: (participant.id === action.payload.id) ? true : participant.hasStar
                }))
            });
        case ACTION_PARTICIPANTS_STAR_REMOVE:
            return Object.assign({}, state, {
                list: state.list.map(participant => Object.assign({}, participant, {
                    hasStar: (participant.id === action.payload.id) ? false : participant.hasStar
                }))
            });
        case ACTION_PARTICIPANTS_CHANGE_PAGE:
            return Object.assign({}, state, {
                page: action.payload.page
            })
        default:
            return state;
    }
};

const user = (state = initialState.user, action) => {
    switch (action.type) {
        case ACTION_USER_LOGIN:
            return Object.assign({}, state, {
                isLoggedIn: true,
                username: action.payload.username,
                token: action.payload.token
            });
        case ACTION_USER_LOGOUT:
            return Object.assign({}, state, {
                isLoggedIn: false,
                username: '',
                token: ''
            });
        case ACTION_USER_RENEW_TOKEN:
            return Object.assign({}, state, {
                token: action.payload.token
            });
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    ui,
    participants,
    user,
});

export default rootReducer;