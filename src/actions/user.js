import { Platform } from 'react-native';
import { actions as routerActions } from 'react-native-router-redux';
import { getUserConnections, updateConnectionsWithChatData } from '../utils/user';
import FCM from 'react-native-fcm';

export function login(token) {
    return function(dispatch, getState) {
        const state =  getState()

        // TODO:: signin to firebase use getInitialRoute() for returning user

        // update start page for the app in state
        dispatch({ type: 'UPDATE_INITIAL_ROUTE', payload: { route: state.routes.userInitial } })
        dispatch({ type: routerActions.actionTypes.ROUTER_PUSH, payload: { name: state.routes.userInitial } })
    }
}

export function addConnection(connection) {
    // PushNotification.localNotification({ message: 'yay! you received a new connection',
    //     group: 'sixwinks', vibrate: false })
    return { type: 'ADD_CONNECTION', payload: { connection: connection } }
}

export function goto(options) {
    return {
        type: routerActions.actionTypes.ROUTER_PUSH,
        payload: { name: options.page, data: options.data }
    }
}

export function updateUserProfile(user, props) {
    user.connections = updateConnectionsWithChatData(user.connections, props)
    return { type: 'UPDATE_PROFILE', payload: { user: user } }
}

export function updateUserConnections(props) {
    return function(dispatch) {
        _updateUserConnections(props, dispatch);
    }
}

export function updateUserConnection(connectionId, data) {
    return { type: 'UPDATE_CONNECTION', payload: { connectionId: connectionId, data: data } }
}

export function updateUserConnectionsChatData(connections) {
    return { type: 'UPDATE_CONNECTIONS', payload: { connections: connections } }
}

export async function _updateUserConnections(props, dispatch) {
    try {
        dispatch({ type: 'LOADING' })

        let connections = await getUserConnections(props.user.connections)
        connections     = updateConnectionsWithChatData(connections, props)
        dispatch({ type: 'UPDATE_CONNECTIONS', payload: { connections: connections } })
        dispatch({ type: 'LOADED' })
    } catch(error) {
        // console.log(error)
    }
}

export function updateInitialTab(initialTab) {
    return { type: 'UPDATE_INITIAL_TAB', payload: { initialTab: initialTab } }
}

export function updateInitialRoute(route) {
    return function(dispatch) {
        dispatch({ type: 'UPDATE_INITIAL_ROUTE', payload: { route: route } })
        dispatch({ type: routerActions.actionTypes.ROUTER_REPLACE, payload: { name: route } })
    }
}

export function updateInitialRoutePush(route) {
    return function(dispatch) {
        dispatch({ type: 'UPDATE_INITIAL_ROUTE', payload: { route: route } })
        dispatch({ type: routerActions.actionTypes.ROUTER_PUSH, payload: { name: route } })
    }
}

export function updateFcmToken(fcmToken) {
    return { type: 'UPDATE_FCM_TOKEN', payload: { fmToken: fcmToken } }
}
