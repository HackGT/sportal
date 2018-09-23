import { loadParticipants, selectParticipant } from "../actions/participants";

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

    onReceiveID(id) {
        // TODO: dispatch loadParticipantsWithID and selectParticipant
        this.store.dispatch(loadParticipants({ids: [id]}));
        this.store.dispatch(selectParticipant(id));
    }
}

export default NFCService;