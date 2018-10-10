import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Header, Button, Menu } from 'semantic-ui-react';
import { bulkDownload } from '../actions/participants';
import { ACTION_UI_DOWNLOAD_HIDE } from '../constants/actions';

class BulkDownloadModal extends Component {
    render() {
        const participants = this.props.participants;
        const viewMode = this.props.viewMode;
        const isDownloadModalActive = this.props.isDownloadModalActive;
        const downloadURL = this.props.downloadURL;
        const downloadState = this.props.downloadState;

        const hideDownload = this.props.hideDownload;
        const downloadAllParticipants = this.props.downloadAllParticipants;
        const downloadStarredParticipants = this.props.downloadStarredParticipants;
        const downloadVisitedParticipants = this.props.downloadVisitedParticipants;
        const downloadCurrentParticipants = this.props.downloadCurrentParticipants;

        // Default modal content before user selection
        let modalContent = (
            <Modal.Content>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <Menu vertical size="large">
                        <Menu.Item
                            name="All"
                            onClick={downloadAllParticipants}
                        >
                            <Header as='h4'>All</Header>
                            <p>Download all participants accepted to the event</p>
                        </Menu.Item>
                        <Menu.Item
                            name="Starred"
                            onClick={downloadStarredParticipants}
                        >
                            <Header as='h4'>Starred</Header>
                            <p>Download only participants starred by you</p>
                        </Menu.Item>
                        <Menu.Item
                            name="Visited"
                            onClick={downloadVisitedParticipants}
                        >
                            <Header as='h4'>Visited</Header>
                            <p>Download only participants who have scanned their badges at your booth</p>
                        </Menu.Item>
                        {
                            viewMode === 'search' && (
                                <Menu.Item
                                    name="Searched"
                                    onClick={() => downloadCurrentParticipants(participants)}
                                >
                                    <Header as='h4'>Searched</Header>
                                    <p>Download only participants currently shown in your search result</p>
                                </Menu.Item>
                            )
                        }
                    </Menu>
                </div>
            </Modal.Content>
        );

        // Default downloadButton, disabled
        let downloadButton = (
            <Button
                primary
                disabled
            >
                Download
            </Button>
        );

        if (downloadState === 'PREPARING') {
            modalContent = (
                <Modal.Content>
                    Your file is being prepared. Please wait.
                </Modal.Content>
            );
            downloadButton = (
                <Button
                    primary
                    loading
                >
                    Download
                </Button>
            );
        } else if (downloadState === 'READY') {
            modalContent = (
                <Modal.Content>
                    Your file has been prepared. Click the button below to begin download.
                </Modal.Content>
            );
            downloadButton = (
                <a href={downloadURL} target="_blank">
                    <Button
                        primary
                        onClick={() => hideDownload()}
                    >
                        Download
                    </Button>
                </a>
            );
        }

        return (
            <Modal
                open={isDownloadModalActive}
                onClose={() => hideDownload()}
                size="small"
                closeOnDimmerClick={false}
                closeIcon={true}
            >
                <Header icon="browser" content="Download" />
                {modalContent}
                <Modal.Actions>
                    {downloadButton}
                </Modal.Actions>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        participants: state.participants.list,
        viewMode: state.ui.viewMode,
        isDownloadModalActive: state.ui.isDownloadModalActive,
        downloadURL: state.ui.downloadURL,
        downloadState: state.ui.downloadState
    };
};
  
const mapDispatchToProps = (dispatch) => {
    return {
        hideDownload: () => {
            dispatch({
                type: ACTION_UI_DOWNLOAD_HIDE
            }); 
        },
        downloadAllParticipants: () => {
            dispatch(bulkDownload({all: true}));
        },
        downloadStarredParticipants: () => {
            dispatch(bulkDownload({star: true}));
        },
        downloadVisitedParticipants: () => {
            dispatch(bulkDownload({nfc: true}));
        },
        downloadCurrentParticipants: (participants) => {
            dispatch(bulkDownload({participants: participants}));
        },
    };
};
  
const ConnectedBulkDownloadModal = connect(
    mapStateToProps,
    mapDispatchToProps
)(BulkDownloadModal);
  
export default ConnectedBulkDownloadModal;