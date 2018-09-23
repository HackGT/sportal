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
export const IS_DEV_ENV = process.env.DEVELOPMENT;
// API URL
export const HOST = (!IS_DEV_ENV) ? (window.location.protocol + '//' + window.location.host) : 'http://localhost:9000';
// NFC Websocket URL (see NFCService for more info)
export const NFC_WS_URL = 'ws://localhost:1337/';