import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Segment, Form, Button } from 'semantic-ui-react';
import DebugHelper from '../debug/debug';

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
            }
        }
    };
};

const ConnectedLoginPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginPage);

export default ConnectedLoginPage;