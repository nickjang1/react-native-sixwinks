'use strict';

import React, { Component } from 'react';
import { Animated, View, Text, Dimensions, StyleSheet, Image } from 'react-native';
import { Icon } from 'native-base';
import { TabViewAnimated, TabBar } from 'react-native-tab-view';

import { themeStyles as styles } from '../config/styles';

const initialLayout = { height: 0, width: Dimensions.get('window').width }

export default class ContainerWithTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
        index: this.props.routes.initialTab,
        routes: [
                { key: 'winks', title: '', icon: 'md-flame' },
                { key: 'chats', title: '', icon: 'md-chatboxes' },
            ]
        }
    }

    _handleChangeTab = (index) => {
        this.setState({ index })
    }

    _renderIndicator = (props) => {
        const { width, position } = props;
        const translateX = Animated.multiply(position, new Animated.Value(width));
        return (
            <Animated.View
                style={[ styles.tabIndicator, { width: width - 8, transform: [ { translateX } ] } ]}
            />
        )
    }

    _renderIcon = ({ navigationState }) => ({ route, index }) => {
        // const selected = navigationState.index === index;
        if(route.key === 'winks') {
            return <Image source={require('../resources/images/icon-wink-white.png')} style={styles.tabIconImage} />
        }
        if(route.key === 'chats') {
            return <Icon name={route.icon} style={styles.tabIcon} />
        }
    }

    _renderBadge = ({ route }) => {
        if (route.key === 'chats' && this.props.chats.unreadChatsCount > 0) {
            return (
                <View style={styles.badge}>
                    <Text style={styles.count}>{this.props.chats.unreadChatsCount}</Text>
                </View>
            )
        }
        return null
    }

    _renderFooter = (props) => {
        return (
            <TabBar {...props} style={styles.tabbar} tabStyle={styles.tab}
                renderIcon={this._renderIcon(props)} renderIndicator={this._renderIndicator}
                renderBadge={this._renderBadge.bind(this)}
            />
        )
    }

    render() {
        return (
            <TabViewAnimated
                style={[ styles.container, this.props.style ]}
                navigationState={this.state}
                renderScene={this.props.renderScene}
                renderFooter={this._renderFooter}
                onRequestChangeTab={this._handleChangeTab}
                initialLayout={initialLayout}
            />
        )
    }
}
