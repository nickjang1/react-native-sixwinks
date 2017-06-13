import _ from 'lodash';
import { AppState } from 'react-native';

export function resetChats() {
    return { type: 'RESET_CHATS' }
}

export function initializeChat(chatId) {
    return { type: 'INITIALIZE_CHAT', payload: { chatId: chatId } }
}

export function markChatAsRead(chatId) {
    return { type: 'MARK_CHAT_AS_READ', payload: { chatId: chatId } }
}

export function viewedImage(chatId, messageId) {
    return { type: 'VIEWED_IMAGE', payload: { chatId: chatId, messageId: messageId }}
}

export function addChatMessage(chatId, message, user, props) {
    let incrementChatUnreadCount = false;
    if(message.user._id !== user.uid && props.router.currentRoute !== 'chat') {
        incrementChatUnreadCount = true;
        let connectionId = _.indexOf(_.map(_.values(user.connections), 'connectionId'), chatId) + 1;
        let messageText = `Chat${connectionId} : ${message.text}`;
    }

    return { type: 'ADD_CHAT_MESSAGE',
        payload: { chatId: chatId, message: message, incrementChatUnreadCount: incrementChatUnreadCount }
    }
}
