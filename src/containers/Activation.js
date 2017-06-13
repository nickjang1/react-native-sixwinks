'use strict';

import axios from 'axios';
import firebase from 'firebase';
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Container, Button, InputGroup, Input, Icon } from 'native-base';
import Alert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import { getUserProfile, getInitialRoute, addConnectionsListener } from '../utils/user';
import dismissKeyboard from 'react-native-dismiss-keyboard';

import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';
import { addChatListeners } from '../utils/chats';

export default class ActivationPage extends Component {
    constructor(props) {
        super(props);
        this.state = { otp: '', spinner: false };
    }
    _verifyOtp() {
        this.setState({ spinner: true });
        axios.post('auth/activate', { uid: this.props.router.data.uid, otp: this.state.otp })
        .then((response) => {

            firebase.auth().signInWithCustomToken(response.data.token)
            .then(() => {
                return getUserProfile(this.props.user)
            })
            .then((user) => {
                this.props.actions.resetChats()
                this.props.actions.updateUserProfile(user, this.props)
                this.props.actions.updateInitialRoutePush(getInitialRoute(user))
                this.props.actions.updateContacts(user)
                addChatListeners(user, this.props)
                addConnectionsListener(user, this.props)
                this.setState({ spinner: false });
            })
            .catch(error => {
                console.log(error)
                this.dropdown.alertWithType('error', 'Error', 'Failed to activate your mobile.')
            });
        }).catch((error) => {
            this.setState({ spinner: false })
            let message = (error.response) ?  error.response.data.message : error.message;
            this.dropdown.alertWithType('error', 'Error', message)
        });
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={()=> dismissKeyboard()}>

                <Container theme={theme} style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.back} onPress={this.props.actions.pop}>back</Text>
                        <HeaderLogo />
                        <Text style={styles.next}></Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.message}>
                            <Text style={styles.text}>
                                please enter the verification code you received in your sms.{'\n'}
                            </Text>
                            <InputGroup style={styles.inputGroup}>
                                <Input  style={styles.input} placeholder='Verification Code' keyboardType="numeric" maxLength={6} onChangeText={(otp) => this.setState({otp})} onSubmitEditing={this._verifyOtp.bind(this)}  returnKeyType="send" blurOnSubmit={false} autoFocus={true}/>
                            </InputGroup>
                            <Button large block info style={styles.btn} textStyle={styles.btnText} onPress={this._verifyOtp.bind(this)}> verify </Button>

                            <Spinner visible={this.state.spinner} size={'large'}/>
                            <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                        </View>
                    </View>
                </Container>
            </TouchableWithoutFeedback>
        );
    }
}


const styles = Object.assign(StyleSheet.create({
    inputGroup: {
        marginBottom: 10,
        marginTop: 30,
        padding: 5,
        backgroundColor: '#f5f5f5'
    },
    input: {
        marginBottom: 5,
        padding: 0,
        fontSize: 20,
    },
    content: {
        flex: 1,
        marginBottom: 60,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        padding: 20,
    },
    message: {
        flex: 1,
    },
}), themeStyles);
