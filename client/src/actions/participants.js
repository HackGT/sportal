import { ACTION_PARTICIPANTS_LOAD, ACTION_PARTICIPANTS_LOAD_BEGIN, ACTION_UI_ERROR_SHOW, ACTION_UI_SELECT_PARTICIPANT_ID } from "../constants/actions";
import { HOST } from "../constants/configs";

export function loadParticipants(ids = null, search = null) {
    return dispatch => {
        dispatch({
            type: ACTION_PARTICIPANTS_LOAD_BEGIN
        });

        let promise = null;

        if (ids) {
            promise = loadParticipantsWithIDs(ids);
        } else if (search) {
            promise = loadParticipantsWithSearch(search);
        } else {
            // No config, load all
            promise = loadParticipantsWithSearch('');
        }

        promise
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(json => {
            // TODO: Detect errors and process response if necessary
            dispatch(loadParticipantsObjects(json.users));
        })
        .catch(() => {
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: 'Connection lost. Please reload this page.'
                }
            })
        });
    };
}

function loadParticipantsObjects(listOfParticipantsObjects) {
    return {
        type: ACTION_PARTICIPANTS_LOAD,
        payload: {
            list: listOfParticipantsObjects
        }
    };
}

function loadParticipantsWithIDs(listOfID) {
    // TODO: Solidify API parameters
}

function loadParticipantsWithSearch(searchTerm) {
    // TODO: Solidify API parameters
    return fetch(`${HOST}/search`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': '',
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({

        })
    });
}

export function selectParticipant(id) {
    // TODO: Fetch resume url and display resume
    return dispatch => {
        dispatch({
            type: ACTION_UI_SELECT_PARTICIPANT_ID,
            payload: {
                id,
                resumeType: 'pdf',
                url: 'https://rsli.github.io/download/resume.pdf'
            }
        });
    };
}

export function starParticipant(id) {
    // TODO: Solidify API parameters
}

export function unstarParticipant(id) {
    // TODO: Solidify API parameters
}

/**
 * This is not really a redux action since it doesn't update the state
 * Fetches URL from backend and force the browser to download from the URL
 * @param {*} id 
 */
export function downloadParticipantResume(id) {
    // TODO: Solidify API parameters

    

    function downloadHelper(url) {
        /*
        * Try to load the pdf without being recogized as a pop up
        * This has different behaviors depending on browsers 
        */
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        if (isChrome) {
            // Should work on Chrome and Webkit
            // Use anchor element to avoid being recognized as pop up
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('target', '_blank');
            link.click();
        } else {
            // Works on Firefox
            window.open(url, '_blank');
        }
    }

    downloadHelper('https://rsli.github.io/download/resume.pdf');
}

