import React from 'react';
import { Table, Button, Label } from 'semantic-ui-react';

class ParticipantTableRow extends React.Component {
    render() {
        const isSelected = this.props.isSelected;
        const participant = this.props.participant;
        const onSelect = this.props.onSelect;

        return (
            <Table.Row>
                <Table.Cell>
                    { isSelected ? <Label ribbon>Viewing</Label> : null }
                    {
                        participant.hasStar ? <Button basic icon="star" /> : <Button basic icon="star outline" />
                    }
                </Table.Cell>
                <Table.Cell>
                    { participant.name }
                </Table.Cell>
                <Table.Cell>
                    { participant.email }
                </Table.Cell>
                <Table.Cell>
                    <Button.Group basic>
                        <Button
                            icon="eye"
                            onClick={() => {
                                onSelect();
                            }}
                        />
                        <Button icon="download" />
                    </Button.Group>
                </Table.Cell>
            </Table.Row>
        );
    }
}

export default ParticipantTableRow;