import {
    ACTION_USER_LOGIN,
    ACTION_PARTICIPANTS_LOAD,
    ACTION_UI_SELECT_PARTICIPANT_ID
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
            token: '',
            sponsor_name: 'Test Company',
            logo_url: 'https://hack.gt/assets/hackgt.svg'
        }
    })
}

DebugHelper.populateSampleParticipants = () => {
    DebugHelper.store.dispatch({
        type: ACTION_PARTICIPANTS_LOAD,
        payload: {
            list: Array.from(new Array(5000), (x, i) => ({
                id: `1111${i}`,
                name: `Siwei Li ${i}`,
                email: "robertsiweili@gatech.edu",
                hasStar: i % 2 === 0,
                major: "Computer Science",
                branch: i % 3 === 0 ? 'mentor': 'default',
                employmentQuestionAnswer: 'Internship / Co-op Summer 2019',
                githubURL: i % 4 === 0 ? 'https://github.com/RSLi': ''
            }))
        }
    })
}

DebugHelper.showSampleResume = (url, fileType) => {
    DebugHelper.store.dispatch({
        type: ACTION_UI_SELECT_PARTICIPANT_ID,
        payload: {
            id: '111111111111',
            resumeType: fileType || 'pdf',
            url: url || 'https://rsli.github.io/download/resume.pdf'
        }
    })
}

DebugHelper.downloadSampleResume = (url) => {
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

    downloadHelper(url);
}

export default DebugHelper;