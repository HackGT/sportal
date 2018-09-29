import React from 'react';
import ReactDOM from 'react-dom';
import jwtDecode from 'jwt-decode';
import { Provider } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import configureStore from './configureStore';
import App from './App';
import NFCService from './services/NFCService';
import DebugHelper from './debug/debug';
import { NFC_WS_URL, HOST } from './constants/configs';
import { ACTION_USER_LOGIN, ACTION_USER_RENEW_TOKEN, ACTION_UI_ERROR_SHOW } from './constants/actions';

const store = configureStore();

// Initialize NFCService for NFC functionalities.
const nfcService = new NFCService(store, NFC_WS_URL);
window.nfcService = nfcService;

// If valid JWT exists, log in the user directly
const token = window.localStorage.getItem('token');
const username = window.localStorage.getItem('username');
if (token && username && token !== '') {
    // Has JWT expired?
    const currentTime = Date.now().valueOf() / 1000;
    const decoded = jwtDecode(token);
    if (typeof decoded.exp !== 'undefined' && decoded.exp > currentTime) {
        // Token not yet expired
        store.dispatch({
            type: ACTION_USER_LOGIN,
            payload: {
                username,
                token
            }
        });

        // Renew token every 5 min
        setInterval(() => {
            console.log('renew token now');
            fetch(`${HOST}/user/renew`, {
                method: 'GET',
                mode: 'cors',
                headers: new Headers({
                    'Authorization': `Bearer ${window.localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({})
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Error: Connection lost. Please check your Internet connection and reload page.');
            }).then(json => {
                window.localStorage.setItem('token', json.jwt);
                store.dispatch({
                    type: ACTION_USER_RENEW_TOKEN,
                    payload: {
                        token: json.jwt
                    }
                })
            }).catch((error) => {
                store.dispatch({
                    type: ACTION_UI_ERROR_SHOW,
                    payload: {
                        message: error.message,
                    }
                })
            });
        }, 300000)
    }
}

// Initialize DebugHelper for browser dev tool debugging
DebugHelper.init(store);
window.debug = DebugHelper;

const renderApp = () => {
    ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
};


// TODO: add redux specific HMR, see https://redux.js.org/recipes/configuringyourstore

renderApp();