/**
 * Created by zayinkrige on 2017/03/07.
 */

import { Platform, PermissionsAndroid } from 'react-native';

export async function requestContactsPermission() {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestPermission(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    'title': '6winks Contacts Permission',
                    'message': '6 Winks needs access to your contacts' +
                    'so you can wink at them.'
                }
            )
            if (granted) {
                console.log("You can read contacts")
            } else {
                console.log("You cannot read contacts")
            }
            return granted;
        } catch (err) {
            console.warn(err)
        }
    } else {
        return true;
    }
}

export async function requestCameraPermission() {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestPermission(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    'title': '6winks Camera Permission',
                    'message': '6 Winks needs access to your camera' +
                    'for chat media'
                }
            )
            if (granted) {
                console.log("You can access camera")
            } else {
                console.log("You cannot access camera")
            }
            return granted;
        } catch (err) {
            console.warn(err)
        }
    } else {
        return true;
    }
}