import React from 'react';
import { connect } from 'react-redux';
import { Button, Menu, Header, Segment } from 'semantic-ui-react';
import { TITLE } from '../constants/configs';

class Navbar extends React.Component {
    render() {
        // Though it does not seem to require rerendering for every state change,
        // but in the future we might add more functionalities that require so.
        const state = this.props.state;
        const logo_url = this.props.state.user.logo_url;
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
            <Segment raised>
                <Menu secondary>
                    <Menu.Item>
                        <Header as='h1'>{ TITLE }</Header>
                    </Menu.Item>
                    <Menu.Menu position="right">
                        {
                            logo_url && logo_url !== '' ? (
                                <img src={logo_url} style={{ height: '54px', width: 'auto' }} alt="" />
                            ) : null
                        }
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

const mapDispatchToProps = () => {
    return {
        actionLogout: () => {
            window.authService.logout();
        }
    };
};

const ConnectedNavbar = connect(
    mapStateToProps,
    mapDispatchToProps
)(Navbar);

export default ConnectedNavbar;


