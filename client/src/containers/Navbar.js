import React from 'react';
import { connect } from 'react-redux';
import { Button, Menu, Header, Segment } from 'semantic-ui-react';
import { TITLE } from '../constants/configs';
import { ACTION_USER_LOGOUT } from '../constants/actions';

class Navbar extends React.Component {
    render() {
        // Though it does not seem to require rerendering for every state change,
        // but in the future we might add more functionalities that require so.
        const state = this.props.state;
        const actionLogout = this.props.actionLogout;
        const logoutButton = (!state.user.isLoggedIn) ? false : (
            <Button
                onClick={() => { actionLogout(); }}
                basic
            >
                Sign Out
            </Button>
        );

        return (
            // <div style={{ width: '100vw', height: '80px', background: '#ffffff', paddingTop: '10px', borderBottom: '1px solid grey' }}>
                
            // </div>
            <Segment raised>
                <Menu secondary>
                    <Menu.Item>
                        <Header as='h1'>{ TITLE }</Header>
                    </Menu.Item>
                    <Menu.Menu position="right">
                        <Menu.Item>
                            { logoutButton }
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
            </Segment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        state: state
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actionLogout: () => {
            dispatch({
                type: ACTION_USER_LOGOUT
            });
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('username');
        }
    };
};

const ConnectedNavbar = connect(
    mapStateToProps,
    mapDispatchToProps
)(Navbar);

export default ConnectedNavbar;


