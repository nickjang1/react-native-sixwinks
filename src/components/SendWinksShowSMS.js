'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { Container } from 'native-base';
import Alert from 'react-native-dropdownalert';
import _ from 'lodash';
import axios from 'axios';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from './HeaderLogo';
import fire from '../utils/firebase';
import Spinner from 'react-native-loading-spinner-overlay';
import {getUserProfile} from '../utils/user';

export default class SendWinksShowSMS extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firebaseToken: '',
        };

    }
    componentDidMount() {
        // TODO:: move this to application wide store/state
        fire.token().then(firebaseToken => {
            this.setState({firebaseToken: firebaseToken})
        })
    }


    _sendWinks() {
        this.setState({ spinner: true })
        let contacts = _.flatten(_.map(this.props.router.data.contacts, 'number'));
        contacts     = _.zipObject(contacts, contacts);
        axios.post('api/winks', { contacts: contacts }, { headers: {'Authorization': this.state.firebaseToken } })
            .then(response => {
                getUserProfile(this.props.user).then((user) => {
                    this.setState({ spinner: false });
                    this.props.actions.updateUserProfile(user, this.props);
                    this.props.actions.goto({ page: 'waitToWink' });
                });

            }).catch(error => {
            this.setState({ spinner: false })
            let message = (error.response) ?  error.response.data.message : error.message;
            this.dropdown.alertWithType('error', 'Error', message)
        });
    }

    _backClick() {
        this.props.actions.pop(2);
    }


    render() {
        return (
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.back} onPress={this._backClick.bind(this)}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.next} onPress={this._sendWinks.bind(this)}>send</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>
                        awesome.{'\n'}
                            <Text style={styles.receivedTextBold}>
                            the following anonymous{'\n'}
                            message will be sent{'\n'}
                            to your winks:{'\n'}
                            </Text>
                        </Text>
                    </View>

                    <View style={styles.receivedImageView}>
                        <Image source={require('../resources/images/received.png')} style={styles.receivedImage}>
                            <View style={styles.backdropView}>
                                <Text style={styles.smsText}>Someone you know has a crush on you. They’ve sent you an anonymous wink through the sixwinks app. See if you can find out who it is at sixwinks.com</Text>
                            </View>
                        </Image>
                    </View>
                    <Spinner visible={this.state.spinner} size={'large'}/>
                    <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
        );
    }
}

const styles = Object.assign(StyleSheet.create({
    backdropView:{
        marginTop: 110,
        marginLeft: 50,
        marginRight: 40,
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0)',
    },
    smsText:{
        fontFamily: theme.fontLight,
        color: "#FFFFFF",
        justifyContent: 'space-between',
        padding: 15,
    },
    content: {
        flex: 1,
        marginBottom: 40,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        paddingBottom: 0,
    },
    message: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 20,
    },
    receivedTextBold: {
        fontFamily: theme.fontRegular,
        color: '#CEDADF',
        fontSize: 20,
    },
    receivedImageView: {
        alignItems: 'center',
    },
}), themeStyles);
