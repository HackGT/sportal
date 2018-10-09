/**
 * -------------------
 * User Customizations
 * -------------------
 */

// Title shown in various parts of the UI
export const TITLE = 'HackGT Sponsorship Portal';


/**
 * --------------------
 * API Configurations
 * --------------------
 */

// Use this to determine whether it is dev build
export const IS_DEV_ENV = process.env.NODE_ENV === 'development';
// API URL
export const HOST = (!IS_DEV_ENV) ? (window.location.protocol + '//' + window.location.host + '/api') : 'http://localhost:8080/api';
// NFC Secure Websocket URL (see NFCService for more info)
// Must be wss, since firefox does not allow ws with https
// Since the websocket server does not support wss yet, use ws for now
export const NFC_WS_URL = 'ws://localhost:1337/';