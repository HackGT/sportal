import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Dimmer, Loader, Input, Button, Form, Dropdown, Menu, Pagination } from 'semantic-ui-react';
import ParticipantsTable from '../components/ParticipantsTable';
import ResumeView from '../components/ResumeView';
import { ACTION_UI_SEARCH_STRING, ACTION_UI_CHANGE_VIEW_MODE } from '../constants/actions';
import { selectParticipant, starParticipant, unstarParticipant, loadParticipants, bulkDownload, changePage } from '../actions/participants';


class MainPage extends Component {
    
    render() {
        const participants = this.props.state.participants.list;
        const page = this.props.state.participants.page;
        const changePage = this.props.changePage;
        const isTableLoading = this.props.state.participants.isLoading;
        const viewMode = this.props.state.ui.viewMode;
        const selectedParticipantID = this.props.state.ui.selectedParticipantID;
        const selectedParticipantResumeType = this.props.state.ui.selectedParticipantResumeType;
        const selectedParticipantResumeURL = this.props.state.ui.selectedParticipantResumeURL;
        const selectParticipant = this.props.selectParticipant;
        const starParticipant = this.props.starParticipant;
        const unstarParticipant = this.props.unstarParticipant;
        const searchString = this.props.state.ui.searchTerm;
        const changeSearchString = this.props.changeSearchString;
        const changeViewMode = this.props.changeViewMode;
        const loadAllParticipants = this.props.loadAllParticipants;
        const loadStarredParticipants = this.props.loadStarredParticipants;
        const loadVisitedParticipants = this.props.loadVisitedParticipants;
        const loadSearchedParticipants = this.props.loadSearchedParticipants;
        const downloadAllParticipants = this.props.downloadAllParticipants;
        const downloadStarredParticipants = this.props.downloadStarredParticipants;
        const downloadVisitedParticipants = this.props.downloadVisitedParticipants;
        const downloadCurrentParticipants = this.props.downloadCurrentParticipants;
        
        
        return (
            <Grid>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Dimmer active={isTableLoading} inverted>
                            <Loader size="medium">Loading</Loader>
                        </Dimmer>
                        <div style={{paddingLeft: '30px'}}>
                            <Form
                                onSubmit={() => {
                                    loadSearchedParticipants(searchString);
                                    changeViewMode('search');
                                }}
                            >
                                <Form.Field>
                                    <Input
                                        fluid
                                        action="Search"
                                        placeholder="Search for names, skills, etc. (eg. Java, React, John..)"
                                        onChange={(e, data) => changeSearchString(data.value)} value={searchString}
                                    />
                                </Form.Field>
                            </Form>
                            <div style={{paddingTop: '20px', display: 'flex', justifyContent: 'space-between'}}>
                                <div>
                                    <Button.Group>
                                        <Button
                                            primary={viewMode === 'all'}
                                            onClick={() => {
                                                loadAllParticipants();
                                                changeViewMode('all');
                                            }}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            primary={viewMode === 'star'}
                                            onClick={() => {
                                                loadStarredParticipants();
                                                changeViewMode('star');
                                            }}
                                        >
                                            Starred
                                        </Button>
                                        <Button
                                            primary={viewMode === 'visit'}
                                            onClick={() => {
                                                loadVisitedParticipants();
                                                changeViewMode('visit')
                                            }}
                                        >
                                            Visited
                                        </Button>
                                        {
                                            viewMode === 'search' && (
                                                <Button
                                                    primary
                                                >
                                                    Searching
                                                </Button>
                                            )
                                        }
                                    </Button.Group>
                                </div>
                                <div>
                                    <Menu vertical>
                                        <Dropdown item text="Download">
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={downloadAllParticipants}>All</Dropdown.Item>
                                                <Dropdown.Item onClick={downloadStarredParticipants}>Starred</Dropdown.Item>
                                                <Dropdown.Item onClick={downloadVisitedParticipants}>Visisted</Dropdown.Item>
                                                <Dropdown.Item onClick={() => downloadCurrentParticipants(participants)}>Currently Viewing</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Menu>
                                </div>
                                
                            </div>
                            <div style={{paddingTop: '20px', textAlign: 'center'}}>
                                <Pagination
                                    pointing
                                    secondary
                                    firstItem={null}
                                    lastItem={null}
                                    activePage={page}
                                    totalPages={Math.ceil(participants.length / 8)}
                                    onPageChange={(e, { activePage }) => changePage(activePage)}
                                />
                            </div>
                            <ParticipantsTable
                                participants={participants.slice((page - 1) * 8, page * 8)}
                                selectedParticipantID={selectedParticipantID}
                                selectParticipant={selectParticipant}
                                starParticipant={starParticipant}
                                unstarParticipant={unstarParticipant}
                            />
                        </div>
                        
                    </Grid.Column>
                    <Grid.Column>
                        <ResumeView
                            selectedParticipantID={selectedParticipantID}
                            selectedParticipantResumeType={selectedParticipantResumeType}
                            selectedParticipantResumeURL={selectedParticipantResumeURL}
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
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
        selectParticipant: (participant) => {
            dispatch(selectParticipant(participant));
        },
        starParticipant: (id) => {
            dispatch(starParticipant(id));
        },
        unstarParticipant: (id) => {
            dispatch(unstarParticipant(id));
        },
        changeSearchString: (searchTerm) => {
            dispatch({
                type: ACTION_UI_SEARCH_STRING,
                payload: {
                    searchTerm
                }
            })
        },
        changeViewMode: (mode) => {
            dispatch({
                type: ACTION_UI_CHANGE_VIEW_MODE,
                payload: {
                    viewMode: mode
                }
            });
        },
        loadAllParticipants: () => {
            dispatch(loadParticipants({}))
        },
        loadStarredParticipants: () => {
            dispatch(loadParticipants({star: true}))
        },
        loadVisitedParticipants: () => {
            dispatch(loadParticipants({nfc: true}))
        },
        loadSearchedParticipants: (searchTerm) => {
            dispatch(loadParticipants({search: searchTerm}))
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
        changePage: (page) => {
            dispatch(changePage(page));
        }
    };
};

const ConnectedMainPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(MainPage);

export default ConnectedMainPage;