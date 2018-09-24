import React from 'react';
import { Table } from 'semantic-ui-react';
import ParticipantTableRow from './ParticipantTableRow';
import { downloadParticipantResume } from '../actions/participants';

class ParticipantsTable extends React.Component {
    render() {
        const participants = this.props.participants;
        const selectedParticipantID = this.props.selectedParticipantID;
        const selectParticipant = this.props.selectParticipant;
        const starParticipant = this.props.starParticipant;
        const unstarParticipant = this.props.unstarParticipant;

        return (
            <Table basic selectable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell></Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                        <Table.HeaderCell></Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        participants.map((participant) => {
                            return (
                                <ParticipantTableRow
                                    key={participant.id}
                                    participant={participant} 
                                    isSelected={selectedParticipantID === participant.id}
                                    onStar={() => {
                                        if (!participant.hasStar) {
                                            starParticipant(participant.id)
                                        } else {
                                            unstarParticipant(participant.id)
                                        }
                                    }}
                                    onSelect={() => {
                                        selectParticipant(participant)
                                    }}
                                    onDownload={() => {
                                        downloadParticipantResume(participant.id)
                                    }}
                                />
                            )
                        })
                    }
                </Table.Body>
            </Table>
        );
    }
}

export default ParticipantsTable;