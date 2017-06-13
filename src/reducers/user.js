import moment from 'moment';

const initialState = {
    uid: null,
    fcmToken: null,
    phoneNumber: null,
    prefix: null,
    connections: [],
    winks: { lastWinkSentAt: null, lastWinkReceivedAt: null, sent: [] }
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_PROFILE':
            return action.payload.user;
        case 'ADD_CONNECTION':
            return Object.assign({}, state, { connections: _addConnection(state, action) });
        case 'UPDATE_CONNECTION':
            return Object.assign({}, state, { connections: _updateConnection(state, action) });
        case 'UPDATE_CONNECTIONS':
            return Object.assign({}, state, { connections: action.payload.connections })
        case 'UPDATE_FCM_TOKEN':
            return Object.assign({}, state, { fcmToken: action.payload.fcmToken })
        default:
            return state;
    }
}

function _addConnection(state, action) {
    let connections   = Object.assign({}, state.connections);
    let newConnection = action.payload.connection;

    connections[newConnection.connectionId] = newConnection;
    return connections
}

function _updateConnection(state, action) {
    let connections  = Object.assign({}, state.connections);
    let connectionId = action.payload.connectionId;
    let data         = action.payload.data;

    if (connections[connectionId] === undefined) { return }
    let connection = connections[connectionId];
    let name       = (data.name !== undefined) ? data.name : connection.name;
    let muted      = (data.muted !== undefined) ? data.muted : connection.muted;

    connections[connectionId] = {
        ...connection,
        name: name,
        muted: muted,
    }

    return connections
}
