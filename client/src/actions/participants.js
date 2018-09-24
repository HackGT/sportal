import { ACTION_PARTICIPANTS_LOAD, ACTION_PARTICIPANTS_LOAD_BEGIN, ACTION_UI_ERROR_SHOW, ACTION_UI_SELECT_PARTICIPANT_ID, ACTION_PARTICIPANTS_LOAD_END } from "../constants/actions";
import { HOST } from "../constants/configs";

export function loadParticipants({ids = null, search = null, star = false}) {
    return dispatch => {
        dispatch({
            type: ACTION_PARTICIPANTS_LOAD_BEGIN
        });

        let promise = null;

        if (ids) {
            promise = loadParticipantsWithIDs(ids);
        } else if (search) {
            promise = loadParticipantsWithSearch(search);
        } else if (star) {
            promise = loadParticipantsWithStars();
        } else {
            // No config, load all
            promise = loadParticipantsWithSearch('');
        }

        promise
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            if (response.status === 403 || response.status === 401) {
                throw new Error('Error: Invalid Credentials.');
            }
            throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
        })
        .then(json => {
            // TODO: Detect errors and process response if necessary
            dispatch(loadParticipantsObjects(json.users));
            dispatch({
                type: ACTION_PARTICIPANTS_LOAD_END
            });
        })
        .catch((error) => {
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: error.message,
                }
            })
        });
    };
}

function loadParticipantsObjects(listOfParticipantsObjects) {
    return {
        type: ACTION_PARTICIPANTS_LOAD,
        payload: {
            list: listOfParticipantsObjects.map(obj => {
                const resumePath = obj.questions.filter(q => q.name==='resume')[0].file.path;
                console.log(resumePath);
                const resumeFile = resumePath.split('/').pop();
                const resumeFileArr = resumeFile.split('.');
                const resumeType = resumeFileArr.pop();
                const resumeId = resumeFileArr.pop();

                return Object.assign({}, obj, {
                    resumePath,
                    resumeType,
                    resumeId
                })
            })
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
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            search: searchTerm,
            // paginationToken: '',
            n: 8,
        })
    });
}

function loadParticipantsWithStars() {
    // TODO: Solidify API parameters
}

export function selectParticipant(id, resumeId) {
    return dispatch => {
        fetch(`${HOST}/resume`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Authorization': `Bearer ${window.localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                resume: resumeId
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
        })
        .then(json => {
            dispatch({
                type: ACTION_UI_SELECT_PARTICIPANT_ID,
                payload: {
                    id,
                    resumeType: 'pdf',
                    url: json.resumeUrl
                }
            });
        })
        .catch((error) => {
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: error.message
                }
            })
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

