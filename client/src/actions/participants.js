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
    ACTION_PARTICIPANTS_CHANGE_PAGE,
    ACTION_UI_DOWNLOAD_PREPARE,
    ACTION_UI_DOWNLOAD_HIDE,
    ACTION_UI_DOWNLOAD_READY
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
            console.log(error.message);
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: 'Error: Connection lost. Please check your Internet connection and reload page.'
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
        fetch(`${HOST}/resume`, {
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
            console.log(error.message);
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: 'Error: Connection lost. Please check your Internet connection and reload page.'
                }
            });
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
            console.log(error.message);
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: 'Error: Connection lost. Please check your Internet connection and reload page.'
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
            console.log(error.message);
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: 'Error: Connection lost. Please check your Internet connection and reload page.'
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

    fetch(`${HOST}/resume`, {
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
            type: ACTION_UI_DOWNLOAD_PREPARE,
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
            bulkDownloadWithIDs(dispatch, participants.map(participant => participant.resumeId));
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
                bulkDownloadWithIDs(dispatch, transformParticipantsObjects(json.participants).map(participant => participant.resumeId));
            }).catch(error => {
                console.log(error.message);
                dispatch({
                    type: ACTION_UI_ERROR_SHOW,
                    payload: {
                        message: 'Failed to download. Please check your Internet connection and try again.'
                    }
                });
                dispatch({
                    type: ACTION_UI_DOWNLOAD_HIDE
                });
            })
        }
    };
}

function bulkDownloadWithIDs(dispatch, listOfResumeIDs) {
    return fetch(`${HOST}/resume/bulk/prepare`, {
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
            return response.json();
        }
        throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
    }).then(json => {
        const downloadId = json.downloadId;
        if (!downloadId) {
            throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
        }

        const intervalId = setInterval(checkStatus, 3000);

        async function checkStatus() {
            let downloadStatus = await fetchBulkDownloadStatus(dispatch, downloadId);
            if (downloadStatus.zipStatus === 'PREPARING') {
                return;
            } else if (downloadStatus.zipStatus === 'READY') {
                // Zip file is ready, show dialog with download link
                dispatch({
                    type: ACTION_UI_DOWNLOAD_READY,
                    payload: {
                        downloadURL: downloadStatus.zipUrl
                    }
                });
                clearInterval(intervalId);
            } else {
                // Failed or expired or unknown status
                clearInterval(intervalId);
            }
        }

    }).catch(error => {
        console.log(error.message);
        dispatch({
            type: ACTION_UI_ERROR_SHOW,
            payload: {
                message: 'Failed to download. Please check your Internet connection and try again.'
            }
        });
        dispatch({
            type: ACTION_UI_DOWNLOAD_HIDE
        });
    });
}

function fetchBulkDownloadStatus(dispatch, downloadId) {
    return fetch(`${HOST}/resume/bulk/status`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Authorization': `Bearer ${window.authService.getUserState().token}`,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            downloadId
        })
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Error: Failed to retrieve bulk download status.');
    }).then(json => {
        const zipStatus = json.zipStatus;
        if (zipStatus === 'PREPARING') {
            return json;
        } else if (zipStatus === 'READY') {
            return json;
        } else if (zipStatus === 'FAILED') {
            dispatch({
                type: ACTION_UI_DOWNLOAD_HIDE
            });
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: 'Error: Server failed to prepare the file at this time. Please try again later.'
                }
            });
            return json;
        } else if (zipStatus === 'EXPIRED') {
            console.error('Bulk download file expired unexpectedly.');
            dispatch({
                type: ACTION_UI_DOWNLOAD_HIDE
            });
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: 'Failed to download at this time. Please try again later.'
                }
            });
            return json;
        } else {
            console.error(`Server responds with unexpected zipStatus: ${zipStatus}`);
            dispatch({
                type: ACTION_UI_DOWNLOAD_HIDE
            });
            dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: 'Failed to download at this time. Please try again later.'
                }
            });
            return 'UNKNOWN';
        }
    }).catch(error => {
        console.log(error.message);
        dispatch({
            type: ACTION_UI_ERROR_SHOW,
            payload: {
                message: 'Failed to download. Please check your Internet connection and try again.'
            }
        });
        dispatch({
            type: ACTION_UI_DOWNLOAD_HIDE
        });
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