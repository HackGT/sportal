import React from 'react';
import { Table, Button, Icon, Popup } from 'semantic-ui-react';

class ParticipantTableRow extends React.Component {
    render() {
        const isSelected = this.props.isSelected;
        const participant = this.props.participant;
        const onSelect = this.props.onSelect;
        const onStar = this.props.onStar;
        // const onDownload = this.props.onDownload;

        return (
            <Table.Row>
                <Table.Cell>
                    {isSelected ? <b>{ participant.name }</b> : participant.name}
                </Table.Cell>
                {/* <Table.Cell>
                    <a href={`mailto:${participant.email}`}>{ participant.email }</a>
                </Table.Cell> */}
                <Table.Cell>
                    { participant.major }
                </Table.Cell>
                <Table.Cell>
                    <Popup
                        trigger={
                            <Button
                                onClick={() => {
                                    onSelect();
                                }}
                            >
                                <Icon name="eye" /> Resume
                            </Button>
                        }
                        content={participant.employmentQuestionAnswer}
                    />
                    
                    {
                        participant.githubURL && participant.githubURL !== '' ? (
                            <a href={participant.githubURL} target="_blank">
                                <Button basic circular icon="github" />
                            </a>
                        ) : null
                    }
                    {
                        participant.branch && participant.branch.toUpperCase() === 'MENTOR' ? (
                            <Popup trigger={<Button basic circular icon="graduation" />} content="This person is a mentor at the event!" />
                        ) : null
                    }
                </Table.Cell>
                <Table.Cell>
                    <Button.Group>
                        {
                            participant.hasStar ? <Button icon basic onClick={onStar}><Icon name="star" color="yellow" /></Button> : <Button icon basic onClick={onStar}><Icon name="star outline" /></Button>
                        }
                        {/* <Button basic icon="download" onClick={onDownload}/> */}
                    </Button.Group>
                </Table.Cell>
            </Table.Row>
        );
    }
}

export default ParticipantTableRow;