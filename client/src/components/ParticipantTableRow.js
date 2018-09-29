import React from 'react';
import { Table, Button, Label } from 'semantic-ui-react';

class ParticipantTableRow extends React.Component {
    render() {
        const isSelected = this.props.isSelected;
        const participant = this.props.participant;
        const onSelect = this.props.onSelect;
        const onStar = this.props.onStar;
        const onDownload = this.props.onDownload;

        return (
            <Table.Row>
                <Table.Cell>
                    { isSelected ? <Label ribbon>Viewing</Label> : null }
                    
                </Table.Cell>
                <Table.Cell>
                    { participant.name }
                </Table.Cell>
                <Table.Cell>
                    <a href={`mailto:${participant.email}`}>{ participant.email }</a>
                </Table.Cell>
                <Table.Cell>
                    <Button.Group>
                        {
                            participant.hasStar ? <Button basic icon="star" onClick={onStar} /> : <Button basic icon="star outline" onClick={onStar} />
                        }
                        <Button
                            basic
                            icon="eye"
                            onClick={() => {
                                onSelect();
                            }}
                        />
                        <Button basic icon="download" onClick={onDownload}/>
                    </Button.Group>
                </Table.Cell>
            </Table.Row>
        );
    }
}

export default ParticipantTableRow;