import { Platform } from 'react-native';
import FCM from 'react-native-fcm';

export function processFcmNotification(notification, props) {
    console.log(notification);

    if (notification && notification.local && notification.local_notification) { return }

    if (notification && notification.fcm === undefined) { return }

    // don't show notification if user is on chat screen
    if(props.router.currentRoute === 'chat' && notification.fcm.tag !== undefined
        && notification.fcm.tag === 'chat') {
        return
    }

    // update app icon badge with unread chats count
    FCM.getBadgeNumber().then(props.chats.unreadMessagesCount + 1);

    // show notification even when the app is in forground
    FCM.presentLocalNotification({
        group: 'sixwinks',
        tag: notification.fcm.tag,
        title: notification.fcm.body,
        body: notification.fcm.body,
        click_action: "fcm.ACTION.HELLO",
        show_in_foreground: true,
        local: true,
        vibrate: null,
    });
}
