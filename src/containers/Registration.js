'use strict';

import axios from 'axios';
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Container, Button, InputGroup, Input, Icon } from 'native-base';
import Alert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';

export default class RegistrationPage extends Component {
    constructor(props) {
        super(props);
        this.state = { mobile: '', prefix:'', spinner: false };
    }

    _getPrefix() {
        let prefix = this.state.prefix;
        if (!_.startsWith(prefix, "+")) {
            prefix = _.replace(prefix, new RegExp('^'), '+')
        }
        return prefix;
    }

    _getNumber() {
        let mobile = this.state.mobile;
        if (_.startsWith(mobile, "0")) {
            mobile = _.replace(mobile, new RegExp('^0'), '')
        }
        let prefix = this._getPrefix();
        let number = prefix + mobile;
        return number;
    }

    _sendOtp() {
        let number = this._getNumber();
        let prefix = this._getPrefix();
        // TODO:: add the spinner overlay into axios interceptors at one place.
        this.setState({ spinner: true });
        axios.post('auth/signup', { mobile: number, prefix: prefix })
        .then((response) => {
            this.setState({ spinner: false })
            this.props.actions.goto({  page: 'activation', data: { uid: response.data.uid } })
        }).catch((error) => {
            let message = (error.response) ?  error.response.data.message : error.message;
            this.dropdown.alertWithType('error', 'Error', message)
            this.setState({ spinner: false })
        });
    }

    render() {
        const { actions } = this.props;

        return (
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.back} onPress={actions.pop}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.next}></Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>please enter your mobile number and click register and we’ll text you a code to submit. simple as that</Text>
                    </View>
                    <KeyboardAwareScrollView keyboardShouldPersistTaps={true}>
                        <View style={styles.phoneNumber}>
                            <InputGroup style={styles.inputPrefix}>
                                <Input style={styles.input}
                                       placeholder='+27'
                                       keyboardType="phone-pad"
                                       maxLength={4}
                                       onChangeText={(prefix) => this.setState({prefix})}
                                       returnKeyType="send"
                                       blurOnSubmit={false}
                                       autoFocus={true}
                                />
                            </InputGroup>
                            <InputGroup style={styles.inputNumber}>
                                <Input style={styles.input}
                                       placeholder='0821234567'
                                       keyboardType="phone-pad"
                                       maxLength={10}
                                       onChangeText={(mobile) => this.setState({mobile})}
                                       returnKeyType="send"
                                       onSubmitEditing={this._sendOtp.bind(this)}
                                       blurOnSubmit={false}
                                />
                            </InputGroup>
                        </View>
                        <Button large block info style={styles.btn} textStyle={styles.btnText} onPress={this._sendOtp.bind(this)}> register </Button>
                    </KeyboardAwareScrollView>
                    <Spinner visible={this.state.spinner} size={'large'}/>
                    <Alert ref={(ref) => this.dropdown = ref} />

                </View>
            </Container>
        );
    }
}

const styles = Object.assign(StyleSheet.create({
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
        justifyContent: 'center',
    },
    phoneNumber: {
        flexDirection:"row",
        marginBottom: 10,
        padding: 5,
        alignSelf: "stretch"

    },
    inputPrefix: {
        backgroundColor: '#f5f5f5',
        flex : 1,
    },
    inputNumber: {
        marginLeft: 20,
        backgroundColor: '#f5f5f5',
        flex: 4,
    },
}), themeStyles);