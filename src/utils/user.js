import _ from 'lodash';
import Promise from 'bluebird';
import axios from 'axios';
import firebase from 'firebase';
import moment from 'moment';
import FCM from 'react-native-fcm';
import { addChatListener } from './chats';

const waitTimeBetweenWinks = 24; // 24 hrs

function hasUserWinkedInLast24Hrs(user) {
    if (!hasUserWinkedYet(user)) {
        console.log("has not winked yet");
        return false
    }

    let lastWinkSent = moment(user.winks.lastWinkSentAt);
    let diff = moment().diff(lastWinkSent, 'hours');
    if (diff < waitTimeBetweenWinks) {
        console.log("has winked in last 24hrs");
        return true;
    }

    console.log("has not winked in last 24hrs");
    return false;
}

export function getInitialRoute(user) {
    // show welcome page if the user is not registerd
    if (!isValidUser(user)) { return 'welcome' }

    // show select winks page if user has not sent winks yet
    if (!hasUserWinkedYet(user)) { return 'selectWinks' }

    // show waiting page if user sent winks in the last 24 hrs
    if (hasUserWinkedInLast24Hrs(user)) { return 'waitToWink' }

    // show winks received page if user has received winks in last 48 hrs
    if (hasRecievedWinksInLast48Hrs(user)) { return 'receivedWinks' }

    // show ready page if user sent winks in the past and is eligible to send winks again
    if (isUserReadyToWinkAgain(user)) { return 'selectWinks' }
}

export function getInitialTab(user) {
    return 0;
    // return (_.size(user.connections) === 0) ? 0 : 1;
}

export async function getUserProfile(propsUser) {
    try {
        let firebaseToken = await getFirebaseToken();
        if (!firebaseToken) {
            return Promise.resolve(propsUser)
        }
        let response = await axios.get('api/profile', { headers: {'Authorization': firebaseToken } });
        let user = response.data.user;
        user.accessToken = firebaseToken
        return Promise.resolve(user);
    } catch(error) {
        return Promise.resolve(propsUser);
    }
}

export async function getUserConnections(connections) {
    try {
        let firebaseToken = await getFirebaseToken();
        if (!firebaseToken) { return Promise.resolve(connections) }
        let response = await axios.get('api/connections', { headers: {'Authorization': firebaseToken } });
        return Promise.resolve(response.data.connections);
    } catch(error) {
        // console.log(error)
        return Promise.resolve(connections);
    }
}

export async function getFirebaseToken() {
    try {
        let user  = await getFirebaseUser()
        if (!user) { return Promise.resolve(null) }

        let token = await firebase.auth().currentUser.getToken(true);
        if (token) { return Promise.resolve(token) }
    } catch(error) {
        // console.log(error)
        throw new Error('Failed to get access token');
    }
}

export function getFirebaseUser() {
    return new Promise(function(resolve, reject) {
        firebase.auth().onAuthStateChanged(function(user) {
            resolve(user);
        })
    })
}

export function isValidUser(user) {
    return (user.uid) ? true : false;
}

export function hasUserWinkedYet(user) {
    if (!user.winks.lastWinkSentAt) { return false }
    if (!moment(user.winks.lastWinkSentAt).isValid()) { return false }
    return true;
}

export function hasRecievedWinksInLast48Hrs(user) {
    return false;
}

export function isUserReadyToWinkAgain(user) {
    if (hasUserWinkedYet(user) && !hasUserWinkedInLast24Hrs(user)) {
        return true
    }
    return false;
}

export function updateConnectionsWithChatData(connections, props) {
    connections = _.keyBy(_.map(connections, function(connection, index) {
        let chat = props.chats[connection.connectionId]

        if(chat !== undefined) {
            connection = { ...connection,
                unreadCount     : chat.unreadCount,
                latestMessage   : chat.latestMessage,
                name            : chat.name,
                muted           : chat.muted,
            }
        }
        return connection;
    }), 'connectionId');

    return connections;
}

export function addConnectionsListener(user, props) {
    if (!user.uid) { return true }
    let latestConnectionId = (_.size(user.connections) > 0) ? _.last(_.values(user.connections)).connectionId : '0';

    firebase.database().ref('users').child(user.uid).child('connections').off();
    firebase.database().ref('users').child(user.uid).child('connections').orderByKey().startAt(latestConnectionId)
        .on('child_added', function(data) {
        if (latestConnectionId !== data.key) {
            let connection = data.val();
            connection.connectionRowId = data.key;
            props.actions.addConnection(connection)
            props.actions.initializeChat(connection.connectionId)
            addChatListener(connection.connectionId, '', user, props);
        }
    })
}

export async function updateFcmToken(user) {
    if(user.fcmToken) { return }

    try {
        let fcmToken     = await getFcmToken()
        let updateStatus = await updateUserProfile({ fcmToken: fcmToken  })
        if(updateStatus === 'success') { return Promise.resolve(fcmToken) }
    } catch(error) {
        console.log(error)
        Promise.resolve(null)
    }
}

export async function updateFcmRefreshToken(fcmToken, props) {
    try {
        let updateStatus = await updateUserProfile({ fcmToken: fcmToken  })
        if(updateStatus === 'success') {
            props.actions.updateFcmToken(token)
            Promise.resolve(true)
        }
    } catch(error) {
        console.log(error)
        Promise.resolve(null)
    }
}

export async function getFcmToken() {
    return new Promise(function(resolve, reject) {
        FCM.getFCMToken().then(resolve)
    })
}

export async function updateUserProfile(userData) {
    try {
        let firebaseToken = await getFirebaseToken();
        if (!firebaseToken) {
            return Promise.resolve()
        }
        let response = await axios.put('api/profile', userData, { headers: {'Authorization': firebaseToken }  });
        return Promise.resolve(response.data.status);
    } catch(error) {
        console.log(error)
        return Promise.resolve(null);
    }
}


export function timeTillNextWink(user) {
    let lastSent = user.winks.lastWinkSentAt;
    let lastWink = moment(lastSent);
    let diff = moment().diff(lastWink);
    let diffDuration = moment.duration(diff);
    let waitTime = moment.duration(waitTimeBetweenWinks, 'h');
    let duration = waitTime.subtract(diffDuration);
    return duration;
}

export function timeTillNextWinkPercent(user) {
    let lastSent = user.winks.lastWinkSentAt;
    let lastWink = moment(lastSent);
    let secondsSinceLastWink = moment().diff(lastWink) / 1000
    let totalHoursToWait =  moment.duration(waitTimeBetweenWinks, 'h');
    let totalSecondsToWait = totalHoursToWait.asSeconds();
    let remain = totalSecondsToWait - secondsSinceLastWink;
    let percent = (remain / totalSecondsToWait) * 100;
    return percent;
}

