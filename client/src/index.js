import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import configureStore from './configureStore';
import App from './App';
import NFCService from './services/NFCService';
import DebugHelper from './debug/debug';
import { NFC_WS_URL } from './constants/configs';
import { ACTION_USER_LOGIN } from './constants/actions';

const store = configureStore();

// Initialize NFCService for NFC functionalities.
const nfcService = new NFCService(store, NFC_WS_URL);
window.nfcService = nfcService;

// If JWT token exists, login the user directly.
const token = window.localStorage.getItem('token');
const username = window.localStorage.getItem('username');
if (token && username) {
    store.dispatch({
        type: ACTION_USER_LOGIN,
        payload: {
            username,
            token
        }
    })
}

// Initialize DebugHelper for browser dev tool debugging
DebugHelper.init(store);
window.debug = DebugHelper;

const renderApp = () => {
    ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
};


// TODO: add redux specific HMR, see https://redux.js.org/recipes/configuringyourstore

renderApp();