import download from 'downloadjs';
import {
    ACTION_PARTICIPANTS_LOAD,
    ACTION_PARTICIPANTS_LOAD_BEGIN,
    ACTION_UI_ERROR_SHOW,
    ACTION_UI_SELECT_PARTICIPANT_ID,
    ACTION_PARTICIPANTS_LOAD_END,
    ACTION_UI_GLOBAL_LOADER_SHOW,
    ACTION_UI_GLOBAL_LOADER_HIDE,
    ACTION_PARTICIPANTS_STAR_ADD,
    ACTION_PARTICIPANTS_STAR_REMOVE,
    ACTION_PARTICIPANTS_CHANGE_PAGE
} from "../constants/actions";
import { HOST } from "../constants/configs";

export function loadParticipants({ids = null, search = null, star = false, nfc = false}) {
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
        } else if (nfc) {
            promise = loadParticipantsWithNFC();
        } else {
            // No config, load all
            promise = loadParticipantsAll();
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
            dispatch(loadParticipantsObjects(json.participants));
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
            });
            dispatch({
                type: ACTION_PARTICIPANTS_LOAD_END
            });
        });
    };
}

function loadParticipantsObjects(listOfParticipantsObjects) {
    return {
        type: ACTION_PARTICIPANTS_LOAD,
        payload: {
            list: transformParticipantsObjects(listOfParticipantsObjects)
        }
    };
}

function transformParticipantsObjects(listOfParticipantsObjects) {
    return listOfParticipantsObjects.map(obj => {
        // Resume related
        const resumePath = obj.questions.filter(q => q.name==='resume')[0].file.path;
        const resumeFile = resumePath.split('/').pop();
        const resumeFileArr = resumeFile.split('.');
        const resumeType = resumeFileArr.pop();
        const resumeId = resumeFile;

        // Tags related
        const hasStar = obj.tags.includes('star');
        const hasNFC = obj.tags.includes('nfc');

        return Object.assign({}, obj, {
            resumePath,
            resumeType,
            resumeId,
            hasStar,
            hasNFC
        });
    });
}

function loadParticipantsWithIDs(listOfID) {
    return fetch(`${HOST}/participant/search/byids`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.authService.getUserState().token}`,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            registration_ids: listOfID
        })
    });
}

function loadParticipantsAll() {
    return fetch(`${HOST}/participant/all`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.authService.getUserState().token}`,
            'Content-Type': 'application/json'
        }),
    });
}

function loadParticipantsWithSearch(searchTerm) {
    return fetch(`${HOST}/participant/search`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.authService.getUserState().token}`,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            search: searchTerm,
        })
    });
}

function loadParticipantsWithStars() {
    // TODO: Solidify API parameters
    // /search/bytag
    return fetch(`${HOST}/participant/search/bytag`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.authService.getUserState().token}`,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            tag: 'star'
        })
    });
}

function loadParticipantsWithNFC() {
    // TODO: Solidify API parameters
    // /search/bytag
    return fetch(`${HOST}/participant/search/bytag`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.authService.getUserState().token}`,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            tag: 'nfc'
        })
    });
}

export function selectParticipant(participant) {
    return dispatch => {
        fetch(`${HOST}/participant/resume`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Authorization': `Bearer ${window.authService.getUserState().token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                resume: participant.resumeId
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
                    id: participant.id,
                    resumeType: participant.resumeType,
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
    return dispatch =>  {
        dispatch({
            type: ACTION_UI_GLOBAL_LOADER_SHOW
        });

        fetch(`${HOST}/participant/tag`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Authorization': `Bearer ${window.authService.getUserState().token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                registration_id: id,
                tag: 'star'
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
        })
        .then(() => {
            dispatch({
                type: ACTION_PARTICIPANTS_STAR_ADD,
                payload: {
                    id
                }
            });
            dispatch({
                type: ACTION_UI_GLOBAL_LOADER_HIDE
            });
        })
        .catch((error) => {
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: error.message
                }
            });
            dispatch({
                type: ACTION_UI_GLOBAL_LOADER_HIDE
            });
        });
    };
}

export function unstarParticipant(id) {
    return dispatch =>  {
        dispatch({
            type: ACTION_UI_GLOBAL_LOADER_SHOW
        });

        fetch(`${HOST}/participant/untag`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Authorization': `Bearer ${window.authService.getUserState().token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                registration_id: id,
                tag: 'star'
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
        })
        .then(() => {
            dispatch({
                type: ACTION_PARTICIPANTS_STAR_REMOVE,
                payload: {
                    id
                }
            });
            dispatch({
                type: ACTION_UI_GLOBAL_LOADER_HIDE
            });
        })
        .catch((error) => {
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: error.message
                }
            });
            dispatch({
                type: ACTION_UI_GLOBAL_LOADER_HIDE
            });
        });
    };
}

/**
 * This is not really a redux action since it doesn't update the state
 * Fetches URL from backend and force the browser to download from the URL
 * @param {*} id 
 */
export function downloadParticipantResume(participant) {    
    // function downloadHelper(url) {
    //     /*
    //     * Try to load the pdf without being recogized as a pop up
    //     * This has different behaviors depending on browsers 
    //     */
    //     const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    //     if (isChrome) {
    //         // Should work on Chrome and Webkit
    //         // Use anchor element to avoid being recognized as pop up
    //         const link = document.createElement('a');
    //         link.setAttribute('href', url);
    //         link.setAttribute('target', '_blank');
    //         link.click();
    //     } else {
    //         // Works on Firefox
    //         window.open(url, '_blank');
    //     }
    // }

    fetch(`${HOST}/participant/resume`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.authService.getUserState().token}`,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            resume: participant.resumeId
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
    })
    .then(json => {
        download(json.resumeUrl);
    })
    .catch((error) => {
        console.log(error.message);
    });

}

export function bulkDownload({all=false, star=false, nfc=false, participants=null}) {
    return dispatch => {
        dispatch({
            type: ACTION_UI_GLOBAL_LOADER_SHOW
        });

        let promise = null;

        if (all) {
            promise = loadParticipantsAll();
        } else if (star) {
            promise = loadParticipantsWithStars();
        } else if (nfc) {
            promise = loadParticipantsWithNFC();
        } else if (participants) {
            // download for selected participants
            bulkDownloadWithIDs(participants.map(participant => participant.resumeId));
        } else {
            console.error('Invalid argument for bulkdownload.')
        }

        if (promise) {
            promise.then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
            }).then(json => {
                bulkDownloadWithIDs(transformParticipantsObjects(json.participants).map(participant => participant.resumeId));
            }).catch(error => {
                console.log(error.message);
            })
        }

        dispatch({
            type: ACTION_UI_GLOBAL_LOADER_HIDE
        });
    };
}

function bulkDownloadWithIDs(listOfResumeIDs) {
    return fetch(`${HOST}/participant/resume/bulk`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.authService.getUserState().token}`,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            resumes: listOfResumeIDs
        })
    }).then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
    }).then(blob => {
        download(blob, 'participant_resume_bundle.zip', 'application/octet-stream');
    }).catch(error => {
        console.log(error.message);
    });
}

export function changePage(page) {
    return {
        type: ACTION_PARTICIPANTS_CHANGE_PAGE,
        payload: {
            page
        }
    };
}