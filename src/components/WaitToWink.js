'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Container, Footer, Button, Icon } from 'native-base';
import TimerMixin from 'react-timer-mixin';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from './HeaderLogo';
import PercentageCircle from 'react-native-percentage-circle';
import {timeTillNextWinkPercent, timeTillNextWink} from '../utils/user'
import {stringify} from '../utils/utils'

export default class WaitToWink extends Component {

    constructor(props) {
        super(props);
        this.state = { timeTillWink: timeTillNextWink(this.props.user)};
        this._setTimer = this._setTimer.bind(this);
        this._setTimer();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.user !== this.props.user) {
            this.setState({ timeTillWink: timeTillNextWink(nextProps.user)})
        }
    }

    componentWillMount(){
    }

    _setTimer() {
        TimerMixin.clearInterval(this.timer);
        this.timer = TimerMixin.setInterval(() => {
            let timeTillNext = timeTillNextWink(this.props.user);
            this.setState({
                timeTillWink: timeTillNext
            })
        }, 1000);

    }

    componentWillUnmount() {
        TimerMixin.clearInterval(this.timer);
    }

    _calcPercent() {
        return timeTillNextWinkPercent(this.props.user);
    }

    _renderTimeRemain() {
        let duration = this.state.timeTillWink;
        let hours = duration.hours();
        if (hours < 10) {
            hours = "0" + hours;
        }
        let minutes = duration.minutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        let seconds = duration.seconds();
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return (
            <Text>
                <Text style={styles.timerHours}>{hours}:</Text>
                <Text style={styles.timerMinutes}>{minutes}:</Text>
                <Text style={styles.timerSeconds}>{seconds}</Text>
            </Text>

        )
    }

    _winkGraph() {
        let percent = this._calcPercent()

        return (
            <View style={styles.percentCirle}>
                <PercentageCircle radius={135} borderWidth={15} innerColor={"#004058"} bgcolor={"#004058"} percent={percent} color={"#3498db"}>
                    <PercentageCircle radius={110} borderWidth={0} innerColor={"#9AB3BD"} bgcolor={"#9AB3BD"} percent={100} color={"#9AB3BD"}>
                        {this._renderTimeRemain()}
                    </PercentageCircle>
                </PercentageCircle>
            </View>
        )
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
                        <View style={styles.winkTimer}>
                            <TouchableOpacity onPress={this.props.actions.routes.selectWinks()}>
                                <Text style={styles.textYay}>
                                    yay! you can send {'\n'}another <Text style={styles.textBold}>sixwinks</Text> in:
                                </Text>
                            </TouchableOpacity>
                        </View>
                    {this._winkGraph()}
                    <Text style={styles.textBottom}>remember, they have no idea</Text>
                    <Text style={styles.textBottom}>who winked at them.</Text>
                    <Text style={styles.textBottom}>{'\n'}you will only be connected if the same person you winked at also winks at you.</Text>
                </View>
            </Container>
        );
    }
}

const styles = Object.assign(StyleSheet.create({
    percentCirle: {
        flex: 1,
        marginTop: 20,
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    winkTimer: {
        marginTop: 10,
    },
    content: {
        flex: 1,
        marginBottom: 40,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        padding: 20,
    },
    textYay: {
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: 16,
    },
    timerHours: {
        fontFamily: theme.fontBold,
        color: '#004058',
        fontSize: 42,
        fontWeight: 'bold',
    },
    timerMinutes: {
        fontFamily: theme.fontRegular,
        color: '#004058',
        fontSize: 42,
        fontWeight: 'normal',
    },
    timerSeconds: {
        fontFamily: theme.fontLight,
        color: '#004058',
        fontSize: 42,
    },
    textBottom: {
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: 14,
    }
}), themeStyles);
