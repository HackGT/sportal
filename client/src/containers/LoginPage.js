import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Segment, Form, Button } from 'semantic-ui-react';
import DebugHelper from '../debug/debug';
import { HOST } from '../constants/configs';
import { ACTION_UI_ERROR_SHOW, ACTION_USER_LOGIN } from '../constants/actions';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "username": "",
            "password": ""
        }
    }

    render() {
        return (
            <Container text>
                <Segment raised>
                    <Form>
                        <Form.Field>
                            <label>Email</label>
                            <input placeholder="email@example.com" onChange={(e) => this.setState({username: e.target.value})} />
                        </Form.Field>
                        <Form.Field>
                            <label>Password</label>
                            <input type="password" placeholder="**********" onChange={(e) => this.setState({password: e.target.value})} />
                        </Form.Field>
                        <Button
                            type="submit"
                            onClick={() => {
                                this.props.actionLogin(
                                    this.state.username,
                                    this.state.password
                                );
                            }}
                        >
                            Log in
                        </Button>
                    </Form>
                </Segment>
            </Container>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        state: state
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actionLogin: (username, password) => {
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
                    dispatch({
                        type: ACTION_UI_ERROR_SHOW,
                        payload: {
                            message: 'Error: Invalid Credentials.'
                        }
                    })
                } else {
                    dispatch({
                        type: ACTION_USER_LOGIN,
                        payload: {
                            username: username,
                            token: json.jwt
                        }
                    });
                    window.localStorage.setItem("username", username);
                    window.localStorage.setItem("token", json.jwt);
                }
            })
            .catch((error) => {
                dispatch({
                    type: ACTION_UI_ERROR_SHOW,
                    payload: {
                        message: error.message
                    }
                })
            });
        }
    };
};

const ConnectedLoginPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginPage);

export default ConnectedLoginPage;