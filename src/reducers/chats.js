import _ from 'lodash';
import {GiftedChat} from 'react-native-gifted-chat';
import FCM from 'react-native-fcm';

const initialState = {
    unreadChatsCount: 0,
    unreadMessagesCount: 0,
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case 'RESET_CHATS':
            return initialState;
        case 'INITIALIZE_CHAT':
            return _initializeChat(state, action);
        case 'ADD_CHAT_MESSAGE':
            return _addConnectionMessage(state, action);
        case 'INCREMENT_CHAT_UNREAD_COUNT':
            return _incrementChatUnreadCount(state, action);
        case 'MARK_CHAT_AS_READ':
            return _markChatAsRead(state, action);
        case 'VIEWED_IMAGE':
            return _imageViewed(state, action);
        default:
            return state;
    }
}

function _initializeChat(state, action) {
    let chats     = Object.assign({}, state);
    let chatId    = action.payload.chatId;
    let chat      = chats[chatId]
    var messages  = undefined;

    if (chat !== undefined) {
        messages = chat.messages;
    }

    if (messages == undefined) {
        //there are no existing messages in this chat, so we can initialize it
        chats[chatId] = {messages: [], latestMessage: null, unreadCount: 0, name: "new chat"};
    } else {
        //filter duplicate messages
        let messages  = _.uniqBy(messages, '_id');
        chats[chatId] = {messages: messages, latestMessage: null, unreadCount: 0, name: "new chat"};
    }

    return chats
}
function _imageViewed(state, action) {
    let chats     = Object.assign({}, state);
    let chatId    = action.payload.chatId;
    let messageId = action.payload.messageId;
    alert('ttt')
    let length = chats[chatId].messages.length;
    for( var i = 0; i < length; i ++ ) {
        if (chats[chatId].messages[i] ._id === messageId) {
            var messageTemp = { _id : messageId, text: "Viewed Image -- Thanks", createdAt: "2017-03-15T23:46:43+00:00" };
            chats[chatId].messages[i] = messageTemp;
            // chats[chatId].messages[i].image = undefined;
            // chats[chatId].messages[i].text = "Viewed Image -- Thanks";
        };
    }
    return chats
}
function _addConnectionMessage(state, action) {
    let chatId    = action.payload.chatId;
    let message   = action.payload.message;
    if (message.text.startsWith("xxxIMAGExxx:")) {
        let image = message.text;
        message.text = "";
        image = image.substr(12)
        image = "data:image/jpg;base64," + image;
        message.image = image;
    }
    let chats     = Object.assign({}, state);
    
    let messages  = (chats[chatId] !== undefined) ? chats[chatId].messages : [];

    let unreadCount = (chats[chatId].unreadCount !== undefined) ? chats[chatId].unreadCount : 0;

    if(action.payload.incrementChatUnreadCount) { unreadCount++ }
    chats[chatId] = {
        ...chats[chatId],
        messages: GiftedChat.append(messages, message),
        latestMessage: message,
        unreadCount: unreadCount,
    };
    chats.unreadChatsCount = _getUnreadChatsCount(chats);
    chats.unreadMessagesCount = _getTotalUnreadMessagesCount(chats);
    FCM.setBadgeNumber(chats.unreadMessagesCount)
    // alert(JSON.stringify(chats[chatId].messages));
    return chats
}

function _markChatAsRead(state, action) {
    let chats       = Object.assign({}, state);
    let chatId      = action.payload.chatId;

    chats[chatId].unreadCount = 0;
    chats.unreadChatsCount    = _getUnreadChatsCount(chats);
    chats.unreadMessagesCount = _getTotalUnreadMessagesCount(chats);

    return chats
}

function _getUnreadChatsCount(chats) {
    return _.sum(_.map(chats, function(chat) {
        return (chat.unreadCount !== undefined && chat.unreadCount > 0) ? 1 : 0;
    }));
}

function _getTotalUnreadMessagesCount(chats) {
    return _.sum(_.map(chats, function(chat) {
        return (chat.unreadCount !== undefined && chat.unreadCount > 0) ? chat.unreadCount : 0;
    }));
}
