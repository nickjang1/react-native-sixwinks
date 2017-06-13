import _ from 'lodash';
import Promise from 'bluebird';
import firebase from 'firebase';
import moment from 'moment';

export async function addChatListeners(user, props) {
    return new Promise(function(resolve, reject) {
        if(_.size(user.connections) === 0) { resolve(true) }

        _.forEach(user.connections, function(connection) {
            let chatId          = connection.connectionId
            let latestMessageId = '';
            if (props.chats[chatId] === undefined) {
                props.actions.initializeChat(chatId)
            }
            if (props.chats[chatId] !== undefined && props.chats[chatId].latestMessage) {
                latestMessageId = props.chats[chatId].latestMessage._id;
            }

            addChatListener(chatId, latestMessageId, user, props);
        })
        resolve(true)
    })
}

function deleteMessageOffServer(message, chatId) {
    let messageId = message._id;
    firebase.database().ref('chats').child(chatId).child('messages').child(messageId).remove();
}

export function addChatListener(chatId, latestMessageId, user, props) {

    // remove any existing listener
    firebase.database().ref('chats').child(chatId).child('messages').off();

    // firebase.database().ref('chats').child(chatId).child('messages').

    firebase.database().ref('chats').child(chatId).child('messages').orderByKey().startAt(latestMessageId)
    .on('child_added', function(data) {
        // alert('yyy');
        let message = data.val();
        message._id = data.key;
        if (latestMessageId !== message._id) {
            props.actions.addChatMessage(chatId, message, user, props)
        }
        let messageUser = message.user._id;

        if (messageUser !== user.uid) {
            //this message was sent by another user
            //therefore I am the recipient of this message

            //i have received the message so it can be deleted off server
            //we can remove it off server, because it gets stored in redux locally

            //TODO: implement deleting of messages off server
            //deleteMessageOffServer(message, chatId)
        }
    })
}

export function parseChatDate(date) {
    moment.updateLocale('en', {
        'calendar' : {
            sameDay : 'h:mmA',
            lastDay : 'D/MM/YYYY',
            lastWeek : 'D/MM/YYYY',
            sameElse : 'D/MM/YYYY',
        }
    });

    return moment(date).calendar();
}

export function trimText(text, length) {
    if(text.length < length) { return text }

    //trim the string to the maximum length
    let trimmedString = text.substring(0, length);

    //re-trim if we are in the middle of a word
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' ')))
    trimmedString = trimmedString + '..';

    return trimmedString;
}
