import React, { Component } from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';
import { Container } from 'native-base';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';

import axios from 'axios';

export default class ViewImage extends Component {
    constructor(props) {
        super(props);
        let image = props.router.data.image;
        let messageId = props.router.data.messageId;
        this.state = {
            image : image,
            messageId : messageId
        };
        this._goBack = this._goBack.bind(this);
        this._markImageViewed = this._markImageViewed.bind(this);
    }
    _goBack() {
        this._markImageViewed();
    }

    _markImageViewed(){
        let receiverUid = this.props.router.data.receiverUid;
        let myUid = this.props.user.uid;
        if (myUid !== receiverUid) {
            let params = {
                chatId: this.props.router.data.connectionId,
                receiverUid: this.props.router.data.receiverUid,
                messageId: this.state.messageId,
            };
            let headers = {headers: {'Authorization': this.props.user.accessToken}}
            let data = this.props.router.data;
            data.image = null;
            data = {
                data: data,
            }
            this.props.actions.viewedImage(this.props.router.data.connectionId, this.state.messageId)
            axios.post('api/imageViewed', params, headers)
                .then(result => {
                    console.log(result);
                    
                    this.props.actions.pop(data)
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            let data = this.props.router.data;
            this.props.actions.pop({data: data});
        }

    }

    render() {
        let image = this.state.image;
        return (
            <Container theme={theme} style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.back} onPress={this._goBack}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.next}></Text>
                </View>
                <Image style={styles.image} source={{uri:image}}/>
            </Container>
        )
    }
}

const styles = Object.assign(StyleSheet.create({
    content: {
        flex: 1,
        marginBottom: 40,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        padding: 20,
    },
    image : {
        flex : 1,
        resizeMode: 'contain',

    }
}), themeStyles);
