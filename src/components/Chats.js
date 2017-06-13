'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text, ListView, ListViewDataSource, Image, ActivityIndicator } from 'react-native';
import { Container, Footer, Button, List, ListItem, Icon, Badge } from 'native-base';
import Alert from 'react-native-dropdownalert';
import _ from 'lodash';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';
import { updateConnectionsWithChatData } from '../utils/user';
import { parseChatDate, trimText } from '../utils/chats';
import {stringify} from '../utils/utils';

export default class Chats extends Component {
    _getConnections(props) {
        var values = _.values(props.user.connections);
        values = _.orderBy(values, function(e) {
            let latestMessage = e.latestMessage;
            if (latestMessage !== undefined && latestMessage !== null) {
                return e.latestMessage.createdAt;
            } else {
                return e.createdAt;
            }

        }, ['desc']);
        return values;
    }

    constructor(props) {
        super(props);
        let dataSource = new ListView.DataSource({rowHasChanged: (oldRow, newRow) => oldRow !== newRow});
        let values = this._getConnections(this.props);
        this.state = {
            connections             : _.values(this.props.user.connections),
            connectionsDataSource   : dataSource.cloneWithRows(values)
        }
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.user.connections !== this.props.user.connections) {
            setTimeout(function () {
                let values = this._getConnections(nextProps);
                this.setState({
                    connections: _.values(nextProps.user.connections),
                    connectionsDataSource: this.state.connectionsDataSource.cloneWithRows(values)
                })
            }.bind(this), 100);
        }

        if(nextProps.chats !== this.props.chats) {
            let connections = updateConnectionsWithChatData(this.props.user.connections, nextProps);
            this.props.actions.updateUserConnectionsChatData(connections);
        }
    }

    _showUnreadCount(connection) {
        if (this._muted(connection)) {
            return false;
        }
        return (connection.unreadCount !== undefined && connection.unreadCount > 0) ? true : false
    }
    _showLatestMessage(connection) {
        if (this._muted(connection)) {
            return false;
        }
        return (connection.latestMessage !== undefined && connection.latestMessage) ? true : false
    }
    _muted(connection){
        return (connection.muted !== undefined && connection.muted) ? true : false
    }
    render() {
        return (
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.back}></Text>
                    <HeaderLogo />
                    <Text style={styles.next}></Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>my <Text style={styles.textBold}>chats</Text></Text>
                        { (this.props.routes.loading) ? <ActivityIndicator size={'large'} color={'white'} style={styles.spinnerRight}/> : <Text style={styles.next}></Text> }
                    </View>

                    <View style={styles.connectionList}>
                    {(_.isEmpty(this.state.connections)) ?
                        <Text style={styles.text}>none of your sixwinks made a connection, yet.</Text> :
                        <ListView initialListSize={10} pageSize={50} enableEmptySections
                            showsVerticalScrollIndicator={false} removeClippedSubviews = {false}
                            dataSource={this.state.connectionsDataSource}
                            renderRow={(connection, sectionId, rowId) =>
                                <ListItem style={styles.connectionItem}
                                    button onPress={() => this.props.actions.goto({  page: 'chat', data: { connectionId: connection.connectionId, receiverUid: connection.uid, connectionRowId: connection.connectionRowId } })}>
                                    <Text style={styles.connectionText}>
                                        <Text style={styles.textChatId}>
                                            { (connection.name) ? connection.name : "chat " + parseInt(parseInt(rowId)+1) }
                                        </Text>


                                    { this._showLatestMessage(connection) ?
                                        <Text style={styles.messageText}>{'\n'}
                                            {trimText(connection.latestMessage.text, 25 )}
                                        </Text>
                                    :
                                        <Text>
                                        { !this._muted(connection) &&
                                        <Text>
                                            <Text style={styles.textHello}> say hello </Text>
                                                <Text style={styles.connectionCreatedAt}>{'\n'}
                                                <Text style={styles.linkMade}>link made </Text>
                                                {parseChatDate(connection.createdAt)}
                                            </Text>
                                        </Text>
                                        }
                                        </Text>
                                    }
                                    </Text>

                                    <View style={styles.connectionRight}>
                                        <View >
                                        { this._showLatestMessage(connection) &&
                                            <Text style={styles.textRight}>
                                                <Text style={styles.connectionCreatedAt}>
                                                    {parseChatDate(connection.latestMessage.createdAt)}
                                                </Text>
                                            </Text>
                                        }
                                        { this._showUnreadCount(connection) &&
                                            <View style={styles.contentsRight}>
                                                <View style={styles.counter}>
                                                    <Text style={styles.count}>{connection.unreadCount}</Text>
                                                </View>
                                             </View>
                                        }
                                        { this._muted(connection) &&
                                            <Text style={styles.textMuted}>muted</Text>
                                        }
                                        </View>
                                    </View>
                                </ListItem>
                            }>
                        </ListView>
                    }
                    </View>

                    <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
        );
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
        padding: 15,
    },
    message: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 70,
        marginLeft: 0,
    },
    spinnerRight: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    connectionList: {
        flex: 1,
        justifyContent: 'center',
    },
    connectionItem: {
        borderWidth: 1,
        padding: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderColor: '#568090',
        marginLeft: 0,
        marginBottom: 10,
    },
    textHello: {
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: 20,
    },
    textChatId: {
        fontFamily: theme.fontRegular,
        color: '#fff',
        fontSize: 22,
    },
    connectionText: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: 20,
        // textAlign: 'left',
        lineHeight: 25,
    },
    connectionRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 4,
        // marginLeft: 0,
    },
    contentsRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginTop: 2,
    },
    textRight: {
        textAlign: 'right',
    },
    textMuted: {
        textAlign: 'right',
        color:  '#FF0000'
    },
    connectionIcon: {
        width: 40,
        height: 40,
    },
    connectionCreatedAt: {
        fontFamily: theme.fontRegular,
        color: '#00B7FF',
        fontSize: 12,
        textAlign: 'right',
    },
    linkMade: {
        fontFamily: theme.fontRegular,
        color: '#00B7FF',
        fontSize: 16,
    },
    messageText: {
        fontFamily: theme.fontRegular,
        color: '#00B7FF',
        fontSize: 15,
    },
}), themeStyles);
