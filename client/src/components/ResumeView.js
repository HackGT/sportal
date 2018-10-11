import React, { Component } from 'react';
// import { Document, Page } from 'react-pdf';
import { Icon } from 'semantic-ui-react';


class ResumeView extends Component {
    render() {
        // const resumeURL = this.props.resumeURL;
        const selectedParticipantID = this.props.selectedParticipantID;
        const selectedParticipantResumeType = this.props.selectedParticipantResumeType;
        const selectedParticipantResumeURL = this.props.selectedParticipantResumeURL;

        let view = null;

        const emptyView = (
            <div style={{width: '100%', height: '100%', display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center"}}>
                <div style={{fontSize: '200%', height: '20%'}}><b></b></div>
                <div style={{fontSize: '150%', height: '20%'}}>
                    <Icon name='file pdf outline' size="big"/>
                    <div style={{height: '30px'}} />
                    <b>No participant selected</b>
                </div>
            </div>
        );

        const pdfView = (
            // <Document
            //   file={selectedParticipantResumeURL}
            // >
            //   <Page pageNumber={1} scale={1.8} />
            // </Document>
            <iframe style={{width: '100%', height: '100%'}} title="pdf-viewer" src={selectedParticipantResumeURL} />
        );

        const docView = (
            <iframe style={{width: '100%', height: '100%'}} title="word-viewer" src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(selectedParticipantResumeURL)}`} />
        );

        const otherView = (
            <div style={{width: '100%', height: '100%', display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center"}}>
                <div style={{fontSize: '150%', height: '20%'}}>
                    <Icon name='warning circle' size="big"/>
                    <div style={{height: '30px'}} />
                    <b>Participant submitted unsupported resume format</b>
                </div>
            </div>
        );

        if (selectedParticipantID === '') {
            view = emptyView;
        } else if (selectedParticipantResumeType === 'pdf') {
            view = pdfView;
        } else if (selectedParticipantResumeType === 'docx' || selectedParticipantResumeType === 'doc') {
            view = docView;
        } else {
            view = otherView;
        }

        return (
            <div style={{width: "100%", height: "85vh", overflow: "scroll", backgroundColor: "lightgrey"}}>
                {view}
            </div>
        );
    }
}

export default ResumeView;