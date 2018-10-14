import { loadParticipants } from "../actions/participants";
import { ACTION_UI_CHANGE_VIEW_MODE } from "../constants/actions";
import { HOST } from "../constants/configs";

/**
 * This class listens on the provide websocket url,
 * where a separate websocket server connected to an NFC
 * reader will read the registration id from
 * a participant's badge, and send the id to this service.
 * 
 * Whenever the id is received, the NFCService will fetch
 * the resume and other info of the participant from backend
 * with the id, and display them directly. The backend is also
 * supposed to flag the participant as "visited" this
 * particular sponsor/recruiter.
 */
class NFCService {
    constructor(store, url) {
        this.isConnected = false;
        this.store = store;
        this.url = url;
        try {
            this.socket = new WebSocket(url);
            this.socket.onopen = () => {
                console.log("NFCService Websocket connection established.");
                this.isConnected = true;
            };
            this.socket.onmessage = (event) => {
                console.log(event.data);
                this.onReceiveID(JSON.parse(event.data)["badgeID"]);
            };
            this.socket.onerror = (event) => {
                console.error("Websocket error observed: ", event);
                console.log("Websocket connection to the NFC service has failed, disabling the optional NFC service.");
                this.isConnected = false;
            };
            this.socket.onclose = () => {
                console.log("NFCService Websocket closed.");
            };
        }
        catch(error) {
            console.error(error);
        }
        
    }

    onReceiveID(id) {
        // Load the participant
        this.store.dispatch(loadParticipants({ids: [id]}));
        // Mark the participant as visited by adding the 'nfc' tag
        fetch(`${HOST}/participant/tag`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Authorization': `Bearer ${window.authService.getUserState().token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                registration_id: id,
                tag: 'nfc'
            })
        })
        .then(response => {
            if (response.ok) {
                console.log(`Tagged ${id} with visisted by NFC`);
            } else {
                console.error(`Failed to tag ${id} as visited by NFC`);
            }
        })
        .catch(error => {
            console.error(error.message);
        });

        // Mark the participant as confirmed/opted-in if not already
        // (some of the participants did not explicitly agree to expose
        // their data in Sponsorship Portal before the event, so scanning
        // their NFC badge will be considered an explicit authorization)
        fetch(`${HOST}/participant/confirm`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Authorization': `Bearer ${window.authService.getUserState().token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                registration_id: id,
                opt_in: true,
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Successfully confirmed');
            } else {
                console.error(`Failed to confirm ${id}`);
            }
        })
        .catch(error => {
            console.error(error.message);
        });

        this.store.dispatch({
            type: ACTION_UI_CHANGE_VIEW_MODE,
            payload: {
                viewMode: 'visit'
            }
        });

        // Send request to HackGT/checkin, for keeping track of participant score
        // by marking them as attended for this event.
        fetch(`${HOST}/participant/checkin`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: new Headers({
                'Authorization': `Bearer ${window.authService.getUserState().token}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                registration_id: id,
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Successful check in');
            } else {
                console.error(`Failed to check in ${id}`);
            }
        })
        .catch(error => {
            console.error(error.message);
        });
    }
}

export default NFCService;