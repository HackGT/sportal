import React, { Component } from 'react';
import { Document, Page } from 'react-pdf';

class ResumeView extends Component {
    render() {
        // const resumeURL = this.props.resumeURL;
        const selectedParticipantID = this.props.selectedParticipantID;
        const selectedParticipantResumeType = this.props.selectedParticipantResumeType;
        const selectedParticipantResumeURL = this.props.selectedParticipantResumeURL;

        let view = null;

        const emptyView = (
            <div style={{display: "flex", justifyContent: "center", alignContent: "center", textAlign: "center"}}>
                <b>No participant selected</b>
            </div>
        );

        const pdfView = (
            <Document
              file={selectedParticipantResumeURL}
            >
              <Page pageNumber={1} scale={1.2} />
            </Document>
        );

        const docView = (
            <iframe title="word-viewer" src={`"http://docs.google.com/gview?url=${selectedParticipantResumeURL}&embedded=true"`} />
        );

        const otherView = (
            <div style={{display: "flex", justifyContent: "center", alignContent: "center", textAlign: "center"}}>
                <b>The participant has submitted a resume in neither PDF nor doc. We are unable to display the document.</b>
            </div>
        );

        if (selectedParticipantID === '') {
            view = emptyView;
        } else if (selectedParticipantResumeType === 'pdf') {
            view = pdfView;
        } else if (selectedParticipantResumeType === 'docx') {
            view = docView;
        } else {
            view = otherView;
        }

        return (
            <div style={{width: "100%", height: "95vh", overflow: "scroll", backgroundColor: "lightgrey"}}>
                {view}
            </div>
        );
    }
}

export default ResumeView;