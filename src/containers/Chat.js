import React, { Component } from 'react';
import { Image, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Container, Icon } from 'native-base';
import {GiftedChat, Actions, Bubble, Day, Message, MessageText, Time, Composer, InputToolbar} from 'react-native-gifted-chat';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import firebase from 'firebase';
import Alert from 'react-native-dropdownalert';
import _ from 'lodash';
import axios from 'axios';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';
import ImagePicker from 'react-native-image-picker';
import { requestCameraPermission } from '../utils/permissions'

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = { messages: [], typing: false }
        let connectionId = this.props.router.data.connectionId;
        let connection = props.user.connections[connectionId];
        let muted = connection.muted;
        this.state = {muted : muted};
        this.chatRef = firebase.database().ref('chats').child(connectionId);
        this._sendMessage = this._sendMessage.bind(this);
        this._renderActions = this._renderActions.bind(this);
        this._touchImage  = this._touchImage.bind(this);
        this._renderMessageImage  = this._renderMessageImage.bind(this);
        this.chatRef.child('messages').on('child_changed', function(snapshot){
            alert('messages');
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user.connections !== this.props.user.connections) {
            let connectionId = nextProps.router.data.connectionId;
            let connection = nextProps.user.connections[connectionId];
            if (connection !== undefined) {
                let muted = connection.muted;
                this.setState({muted: muted});
            }
        }
    }

    componentWillMount() {
        if (Platform.OS === 'android') { AndroidKeyboardAdjust.setAdjustResize() }
        if (!this.state.muted) {
            if (this.props.router.data.receiverUid) {
                this.chatRef.child('members/' + this.props.router.data.receiverUid).off();
                this.chatRef.child('members/' + this.props.router.data.receiverUid).on('child_changed', this._updateTyping.bind(this));                
            }
        }
        this.props.actions.markChatAsRead(this.props.router.data.connectionId)
        requestCameraPermission();
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') { AndroidKeyboardAdjust.setAdjustPan() }
        if (this.props.router.data.receiverUid) {
            this.chatRef.child('members/' + this.props.router.data.receiverUid).off();
        }
    }

    _touchImage(image, messageId) {
        let data = this.props.router.data;
        data.image = image;
        data.messageId = messageId;
        // console.log(data);
        this.props.actions.goto({  page: 'viewImage', data: data })
    }

    _sendMessage(messages = []) {

        let headers = { headers: {'Authorization': this.props.user.accessToken } }
        let message = _.first(messages);
        let params  = { chatId: this.props.router.data.connectionId,
                        receiverUid: this.props.router.data.receiverUid,
                        message: message.text
                    }
                    
        axios.post('api/messages', params, headers).catch(error => {
            console.log('Failed to send your chat message');
            this.dropdown.alertWithType('error', 'Error', 'Failed to send chat message')
        })
        this._sendTyping('')
    }

    _sendTyping(text) {
        typing = (text.trim().length > 0) ? true : false;
        this.chatRef.child('members/' + this.props.user.uid).set({
            typing: typing
        }).catch(function(error) {
            console.error('Error updating typing status', error);
        });
    }

    _updateTyping(data) {
        if (data.key === 'typing') { this.setState({ typing: data.val() }) }
    }

    _renderLoading(props) {
        return (
            <ActivityIndicator size={'large'} color={'white'} style={styles.spinner}/>
        )
    }

    _renderDay(props) {
        return (
            <Day {...props} textStyle={styles.day} />
        )
    }

    _renderMessage(props) {
        return (
            <Message {...props} imageStyle={{ left: styles.noAvatar, right: styles.noAvatar }} containerStyle={{ left: styles.noAvatarContainer }}/>
        )
    }

    _renderBubble(props) {
        return (
            <Bubble {...props} wrapperStyle={{ left: styles.leftBubble, right: styles.rightBubble }} />
        )
    }

    _renderMessageText(props) {
        let text = props.currentMessage.text;
        //assume no emoji
        let emoji = false;
        //test if string contains ascii chars
        let regex = RegExp("[a-z,A-Z,0-9]");
        if (!regex.test(text)) {
            //it contains no ascii
            regex = RegExp("(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*");
            //does it contain emoji?
            if (regex.test(text)) {
                emoji = true;
            }
        }

        let leftStyle = styles.leftMessageText;
        let righStyle = styles.rightMessageText;
        if (emoji) {
            leftStyle = styles.leftMessageTextEmoji;
            righStyle = styles.rightMessageTextEmoji;
        }
        return (
            <MessageText {...props} textStyle={{ left: leftStyle, right: righStyle }}/>
        )
    }

    _renderMessageImage(props) {
        let uri = props.currentMessage.image;
        let id = props.currentMessage._id;
        return (
            <TouchableOpacity  onPress={()=>this._touchImage(uri, id)}>
                <Image style={styles.image} source={{uri:uri}}/>
            </TouchableOpacity>
        )

    }

    _renderTime(props) {
        return (
            <Time {...props} containerStyle={{ left: styles.timeContainer, right: styles.timeContainer }} textStyle={{ left: styles.leftTimeText, right: styles.rightTimeText }} />
        )
    }

    _renderFooter(props) {
        if (this.state.typing) {
            return (
                <MessageText {...props}
                    containerStyle={{ left: styles.typingContainer }}
                    textStyle={{ left: styles.typingText }}
                    currentMessage={{text: '...'}}
                />
            )
        }
        return null;
    }

    _renderInputToolbar(props) {
        return (
            <InputToolbar {...props} containerStyle={styles.inputToolbar} />
        )
    }

    _renderComposer(props) {
        return (
            <Composer {...props} textInputStyle={styles.composerInput}
                textInputProps = {{onChangeText: this._sendTyping.bind(this)}}
            />
        )
    }

    _renderSend(props) {
        if (props.text.trim().length > 0) {
            return (
                <TouchableOpacity onPress={() => {props.onSend({text: props.text.trim()}, true) }}>
                    <Icon name='md-arrow-dropright-circle' style={styles.send} />
                </TouchableOpacity>
            )
        }
        return <View/>
    }

    _sendMedia(response) {
        if (response.error !== undefined) {
            this.dropdown.alertWithType('error', 'Error', response.error);
            return;
        }
        var fileName = response.fileName;
        if (fileName == undefined) {
            fileName = response.uri;
        }
        fileName = fileName.toUpperCase();
        if (fileName.endsWith(".JPG")) {
            this._sendImage(response);
        } else {
            this._sendVideo(response);
        }
    }

    _sendImage(response) {
        var photo = {
            data: response.data,
            type: 'image/jpeg',
            name: response.fileName,
        };
        let headers = { headers: {'Authorization': this.props.user.accessToken } }
        let params  = {
            chatId: this.props.router.data.connectionId,
            receiverUid: this.props.router.data.receiverUid,
            image: photo
        }

        this.setState({ renderPlaceholder: true });

        axios.post('api/image', params, headers)
            .then((response) => {
                this.setState({ renderPlaceholder: false });
            })
            .catch(error => {
                this.setState({ renderPlaceholder: false });
                console.log('Failed to send your image');
                this.dropdown.alertWithType('error', 'Error', 'Failed to send image')
            })
    }

    _renderActions(props) {
        let context = this;
        var pickerOptions = {
            title: 'Select image',
            customButtons: [
            ],
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };
        const options = {
            'Camera': (optionProps) => {
                ImagePicker.launchCamera(pickerOptions, (response)  => {
                    context._sendMedia(response);
                });
            },
            'Image': (optionProps) => {
                ImagePicker.launchImageLibrary(pickerOptions, (response)  => {
                    context._sendMedia(response);
                });
            },
            'Cancel': () => {},
        };
        return (
            <Actions
                {...props}
                options={options}
            />
        );

    }

    _chatOptions() {
        this.props.actions.goto({  page: 'chatOptions', data: this.props.router.data })
    }

    _hasChatName() {
        let name = this._getChatName()
        if (name == undefined || name == "") {
            return false
        } else {
            return true
        }
    }

    _getChatName(){
        let connection = this.props.user.connections[this.props.router.data.connectionId]
        let name = connection.name;
        return name;
    }

    render() {
        if (this.state.renderPlaceholder) {
            return this._renderPlaceholder()
        }

        console.log('chat', this.props.chats[this.props.router.data.connectionId].messages);

        return (
            <Container theme={theme} style={styles.chatContainer}>
                <View style={styles.chatHeader}>
                    <Text style={styles.back} onPress={this.props.actions.pop}>back</Text>
                    {(this._hasChatName())
                        ?
                        <Text style={styles.chatName}>{this._getChatName()}</Text>
                        : <HeaderLogo/>
                    }
                    <Text style={styles.next} onPress={this._chatOptions.bind(this)}>
                        { (Platform.OS === 'ios') ? <Icon name='ios-more'/> : <Icon name='md-more'/> }
                    </Text>
                </View>
                <View style={styles.chatContent}>
                    {(!this.state.muted) ?
                        <GiftedChat
                            messages={this.props.chats[this.props.router.data.connectionId].messages}
                            user={{ _id: this.props.user.uid }}
                            onSend={this._sendMessage}
                            renderDay={this._renderDay}
                            renderBubble={this._renderBubble}
                            renderMessage={this._renderMessage}
                            renderMessageText={this._renderMessageText}
                            renderMessageImage={this._renderMessageImage}
                            renderLoading={this._renderLoading}
                            renderTime={this._renderTime}
                            renderFooter={this._renderFooter.bind(this)}
                            renderInputToolbar={this._renderInputToolbar}
                            renderComposer={this._renderComposer.bind(this)}
                            renderSend={this._renderSend.bind(this)}
                            renderActions={this._renderActions}
                            isAnimated={false}
                        />
                        : <View/>
                    }
                <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
        )
    }

    _renderPlaceholder() {
        return (
            <Container theme={theme} style={styles.chatContainer}>
                <View style={styles.chatHeader}>
                    <Text style={styles.back} onPress={this.props.actions.pop}>back</Text>
                    {(this._hasChatName())
                        ?
                        <Text style={styles.chatName}>{this._getChatName()}</Text>
                        : <HeaderLogo/>
                    }
                    <Text style={styles.next} onPress={this._chatOptions.bind(this)}>
                        { (Platform.OS === 'ios') ? <Icon name='ios-more'/> : <Icon name='md-more'/> }
                    </Text>
                </View>
                <View style={styles.chatContent}>
                    <ActivityIndicator size={'large'} color={'white'} style={styles.spinner}/>
                </View>
            </Container>
        )
    }

}

const styles = Object.assign(StyleSheet.create({
    leftBubble: {
        backgroundColor: '#004058',
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
    },
    rightBubble: {
        backgroundColor: '#9AB3BD',
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
    },
    leftMessageText: {
        fontFamily: theme.fontRegular,
        color: '#9AB3BD',
        fontSize: 16,
        lineHeight:22,
    },
    rightMessageText: {
        fontFamily: theme.fontRegular,
        color: '#004058',
        fontSize: 16,
        lineHeight:22,
    },
    leftMessageTextEmoji: {
        fontFamily: theme.fontRegular,
        color: '#9AB3BD',
        fontSize: 72,
        lineHeight:84,
    },
    rightMessageTextEmoji: {
        fontFamily: theme.fontRegular,
        color: '#004058',
        fontSize: 72,
        lineHeight:84,
    },
    leftTimeText: {
        color: '#aaa',
        fontFamily: theme.fontRegular,
    },
    rightTimeText: {
        color: '#666',
        fontFamily: theme.fontRegular,
    },
    day: {
        color: '#004058',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#00B7FF',
    },
    chatName:{
        fontFamily: theme.fontRegular,
        color: '#ffffff',
        fontSize: 20,
    },
    chatHeader: {
        backgroundColor: '#004058',
        justifyContent: 'space-between',
        flexDirection:  'row',
        padding: 10,
        alignItems: 'center',
    },
    chatContent: {
        flex: 1,
        backgroundColor: '#00B7FF',
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
    },
    noAvatar: {
        marginRight: 0,
        height:0,
        width:0,
        opacity: 0,
    },
    noAvatarContainer: {
        marginLeft: 0,
    },
    footerContainer: {
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#9AB3BD',
    },
    typingContainer: {
        backgroundColor: '#004058',
        padding: 0,
        marginBottom: 10,
        marginLeft: 10,
        width: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typingText: {
        fontFamily: theme.fontRegular,
        fontWeight: '900',
        color: '#fff',
        fontSize: 30,
        marginTop: 0,
        marginBottom: 15,
    },
    timeContainer: {
        marginBottom: 0,
    },
    composerInput: {
        fontSize: 18,
        lineHeight: 20,
        fontFamily: theme.fontRegular,
    },
    send: {
        color: '#00B7FF',
        fontSize: 32,
        lineHeight: 32,
        marginTop: 6,
        marginBottom: 6,
        marginLeft: 10,
        marginRight: 10,
    },
    inputToolbar: {
    },
    image: {
        width: 150,
        height: 100,
        borderRadius: 13,
        margin: 3,
        resizeMode: 'cover',
    },
}), themeStyles);
