import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Dimmer, Loader, Input, Button, Icon, Form } from 'semantic-ui-react';
import ParticipantsTable from '../components/ParticipantsTable';
import ResumeView from '../components/ResumeView';
import { ACTION_UI_SEARCH_STRING } from '../constants/actions';
import { selectParticipant, starParticipant, unstarParticipant, loadParticipants } from '../actions/participants';


class MainPage extends Component {
    
    render() {
        const participants = this.props.state.participants.list;
        const isTableLoading = this.props.state.participants.isLoading;
        const selectedParticipantID = this.props.state.ui.selectedParticipantID;
        const selectedParticipantResumeType = this.props.state.ui.selectedParticipantResumeType;
        const selectedParticipantResumeURL = this.props.state.ui.selectedParticipantResumeURL;
        const selectParticipant = this.props.selectParticipant;
        const starParticipant = this.props.starParticipant;
        const unstarParticipant = this.props.unstarParticipant;
        const searchString = this.props.state.ui.searchTerm;
        const changeSearchString = this.props.changeSearchString;
        // const loadAllParticipants = this.props.loadAllParticipants;
        const loadStarredParticipants = this.props.loadStarredParticipants;
        const loadSearchedParticipants = this.props.loadSearchedParticipants;
        
        
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
                                    loadSearchedParticipants();
                                }}
                            >
                                <Form.Field>
                                    <Input
                                        fluid
                                        action="search"
                                        placeholder="Search..."
                                        onChange={(e, data) => changeSearchString(data.value)} value={searchString}
                                    />
                                </Form.Field>
                            </Form>
                            <div style={{paddingTop: '20px'}}>
                                <Button
                                    color="yellow"
                                    onClick={() => loadStarredParticipants()}
                                >
                                    <Icon name="star" /> View All Starred Participants
                                </Button>
                            </div>
                            <ParticipantsTable
                                participants={participants}
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
        selectParticipant: (id) => {
            dispatch(selectParticipant(id));
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
        loadAllParticipants: () => {
            dispatch(loadParticipants({}))
        },
        loadStarredParticipants: () => {
            dispatch(loadParticipants({star: true}))
        },
        loadSearchedParticipants: (searchTerm) => {
            dispatch(loadParticipants({search: searchTerm}))
        }
    };
};

const ConnectedMainPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(MainPage);

export default ConnectedMainPage;