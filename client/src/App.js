import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dimmer, Loader, Modal, Header } from 'semantic-ui-react';
import ConnectedNavbar from './containers/Navbar';
import ConnectedMainPage from './containers/MainPage';
import ConnectedLoginPage from './containers/LoginPage';
import { ACTION_UI_ERROR_HIDE } from './constants/actions';

class App extends Component {
  render() {
    return (
      <div>
        <Modal
          open={this.props.isErrorModalActive}
          onClose={() => this.props.hideError()}
          basic
          size="small"
        >
          <Header icon="browser" content="Error"/>
          <Modal.Content>
            <h3>{this.props.errorModalMessage}</h3>
          </Modal.Content>
        </Modal>
        <ConnectedNavbar />
        <div>
          <Dimmer active={this.props.isGlobalLoaderActive} inverted>
            <Loader size="large">Loading</Loader>
          </Dimmer>
          {
            this.props.isLoggedIn ? <ConnectedMainPage /> : <ConnectedLoginPage />
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
      isGlobalLoaderActive: state.ui.isGlobalLoaderActive,
      isLoggedIn: state.user.isLoggedIn,
      isErrorModalActive: state.ui.isErrorModalActive,
      errorModalMessage: state.ui.errorModalMessage,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideError: () => {
      dispatch({
        type: ACTION_UI_ERROR_HIDE
      });
    }
  };
};

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default ConnectedApp;
