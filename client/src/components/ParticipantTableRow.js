import React from 'react';
import { Table, Button, Label, Icon } from 'semantic-ui-react';

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
                    <Button
                        basic
                        onClick={() => {
                            onSelect();
                        }}
                    >
                        <Icon name="eye" />Resume/CV
                    </Button>
                </Table.Cell>
                <Table.Cell>
                    <Button.Group>
                        {
                            participant.hasStar ? <Button basic onClick={onStar}><Icon name="star" color="yellow" /></Button> : <Button basic onClick={onStar}><Icon name="star outline" /></Button>
                        }
                        <Button basic icon="download" onClick={onDownload}/>
                    </Button.Group>
                </Table.Cell>
            </Table.Row>
        );
    }
}

export default ParticipantTableRow;