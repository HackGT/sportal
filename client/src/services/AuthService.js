import { HOST } from "../constants/configs";
import { ACTION_USER_RENEW_TOKEN, ACTION_UI_ERROR_SHOW, ACTION_USER_LOGIN, ACTION_USER_LOGOUT } from "../constants/actions";
import DebugHelper from "../debug/debug";
import { loadParticipants } from "../actions/participants";

class AuthService {
    constructor(store) {
        this.store = store;
    }

    getUserState() {
        return this.store.getState().user;
    }

    startAutoRenew() {
        setInterval(() => {
            console.log('renew token now');
            fetch(`${HOST}/user/renew`, {
                method: 'GET',
                mode: 'cors',
                headers: new Headers({
                    'Authorization': `Bearer ${this.store.getState().user.token}`,
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
                this.store.dispatch({
                    type: ACTION_USER_RENEW_TOKEN,
                    payload: {
                        token: json.jwt
                    }
                })
            }).catch((error) => {
                this.store.dispatch({
                    type: ACTION_UI_ERROR_SHOW,
                    payload: {
                        message: error.message,
                    }
                })
            });
        }, 300000)
    }

    login(username, password) {
        if (username === 'test' && password === 'test') {
            DebugHelper.login();
            return;
        }
        fetch(`${HOST}/user/login`, {
            method: 'POST',
            mode: 'cors',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                email: username,
                password,
            })
        })
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
            if (!json.jwt) {
                this.store.dispatch({
                    type: ACTION_UI_ERROR_SHOW,
                    payload: {
                        message: 'Error: Invalid Credentials.'
                    }
                })
            } else {
                this.store.dispatch({
                    type: ACTION_USER_LOGIN,
                    payload: {
                        username: username,
                        token: json.jwt
                    }
                });
                window.localStorage.setItem("username", username);
                window.localStorage.setItem("token", json.jwt);

                this.store.dispatch(loadParticipants({}));

                // Renew token every 5 min
                this.startAutoRenew();
            }
        })
        .catch((error) => {
            this.store.dispatch({
                type: ACTION_UI_ERROR_SHOW,
                payload: {
                    message: error.message
                }
            })
        });
    }

    logout() {
        this.store.dispatch({
            type: ACTION_USER_LOGOUT
        });
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('username');
    }
}

export default AuthService;