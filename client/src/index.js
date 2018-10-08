import React from 'react';
import ReactDOM from 'react-dom';
import jwtDecode from 'jwt-decode';
import { Provider } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import configureStore from './configureStore';
import App from './App';
import NFCService from './services/NFCService';
import DebugHelper from './debug/debug';
import { NFC_WS_URL } from './constants/configs';
import { ACTION_USER_LOGIN } from './constants/actions';
import { loadParticipants } from './actions/participants';
import AuthService from './services/AuthService';

const store = configureStore();

// Initialize NFCService for NFC functionalities.
const nfcService = new NFCService(store, NFC_WS_URL);
window.nfcService = nfcService;

// Initialize AuthService
const authService = new AuthService(store);
window.authService = authService;

// If valid JWT exists, log in the user directly
const token = window.localStorage.getItem('token');
const username = window.localStorage.getItem('username');
const sponsor_name = window.localStorage.getItem('sponsor_name');
const logo_url = window.localStorage.getItem('logo_url');

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
                token,
                sponsor_name,
                logo_url
            }
        });

        store.dispatch(loadParticipants({}));

        // Renew token every 5 min
        authService.renewToken();
        authService.startAutoRenew();
        
    }
}

// Initialize DebugHelper for browser dev tool debugging
DebugHelper.init(store);
window.debug = DebugHelper;

const renderApp = () => {
    ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
};

renderApp();