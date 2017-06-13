'use strict';

import React, { Component } from 'react';
import { StatusBar, View, Platform, AppState, PushNotificationIOS } from 'react-native';
import { actions as routerActions, Route, Router, Schema } from 'react-native-router-redux';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SplashScreen from 'react-native-splash-screen';
import FCM from 'react-native-fcm';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';

import { getUserProfile, getInitialRoute, addConnectionsListener, updateFcmToken, updateFcmRefreshToken } from '../utils/user';
import { processFcmNotification } from '../utils/notifications';
import { addChatListeners } from '../utils/chats';
import { themeStyles as styles } from '../config/styles';
import Welcome from './Welcome';
import Registration from './Registration';
import Activation from './Activation';
import SelectWinks from './SelectWinks';
import SendWinks from './SendWinks';
import SendWinksShowSMS from './SendWinksShowSMS';
import ReceivedWinks from './ReceivedWinks';
import WaitToWink from './WaitToWink';
import Chat from './Chat';
import ChatOptions from './ChatOptions';
import ViewImage from './ViewImage';

import * as userActions from '../actions/user';
import * as contactActions  from '../actions/contacts';
import * as chatActions  from '../actions/chats';



const mapStateToProps = state => ({
    chats: state.chats,
    contacts: state.contacts,
    router: state.router,
    routes: state.routes,
    user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        ...userActions, ...contactActions, ...chatActions, ...routerActions
    }, dispatch),
    dispatch,
});

class App extends Component {
    componentWillMount() {
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
        getUserProfile(this.props.user).then((user) => {
            this.props.actions.updateUserProfile(user, this.props);
            let route = getInitialRoute(user);
            this.props.actions.updateInitialRoute(route);
            this.props.actions.updateContacts(user);

            this._checkAppPermissions();
            this._resetNotifications();
            this._addNotificationListeners(user);
            addChatListeners(user, this.props);
            addConnectionsListener(user, this.props);
            SplashScreen.hide();

        }).catch((error) => {
            SplashScreen.hide();
            console.log(error);
        });
    }

    componentWillUnmount() {
        this.fcmNotificationUnsubscribe();
        this.fcmTokenUnsubscribe();
    }

    _resetNotifications() {
        FCM.removeAllDeliveredNotifications();
        FCM.setBadgeNumber(0);
    }

    _checkAppPermissions() {
        FCM.requestPermissions();
        if (Platform.OS === 'ios') {
            PushNotificationIOS.requestPermissions();
        }
    }

    async _addNotificationListeners(user) {
        if (!user.fcmToken) {
            let fcmToken = await updateFcmToken(user);
            this.props.actions.updateFcmToken(fcmToken);
        }

        this.fcmTokenUnsubscribe = FCM.on('refreshToken', function(token) {
            updateFcmRefreshToken(token, this.props)
        }.bind(this));

        this.fcmNotificationUnsubscribe = FCM.on('notification', function(notification) {
            processFcmNotification(notification, this.props)
        }.bind(this));
    }

    _handleAppStateChange(currentAppState) {
        if(currentAppState === 'active') {
            this._resetNotifications()
            if(Platform.OS === 'android') {
                if(this.props.router.currentRoute === 'chat') {
                    AndroidKeyboardAdjust.setAdjustResize()
                } else {
                    AndroidKeyboardAdjust.setAdjustPan()
                }
            }
        }
    }

    render() {
        return (
            <View style={styles.container}>

            <StatusBar
                hidden={(Platform.OS === 'android') ? false : true}
            />
            <Router {...this.props} initial={this.props.routes.initial}>
                <Route name="welcome" component={Welcome} type="reset" hideNavBar={true} />
                <Route name="registration" component={Registration} hideNavBar={true} />
                <Route name="activation" component={Activation} hideNavBar={true} />
                <Route name="selectWinks" component={SelectWinks} hideNavBar={true} />
                <Route name="sendWinks" component={SendWinks} hideNavBar={true} />
                <Route name="sendWinksShowSMS" component={SendWinksShowSMS} hideNavBar={true} />
                <Route name="receivedWinks" component={ReceivedWinks} hideNavBar={true} />
                <Route name="waitToWink" component={WaitToWink} hideNavBar={true} />
                <Route name="chat" component={Chat} hideNavBar={true} />
                <Route name="chatOptions" component={ChatOptions} hideNavBar={true} />
                <Route name="viewImage" component={ViewImage} hideNavBar={true} />
            </Router>

            </View>
        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(App)
