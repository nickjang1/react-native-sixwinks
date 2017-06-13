import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';

const logo   = require('../resources/images/text-logo.png');
const styles = StyleSheet.create({
    logo: {
        height: 35,
        width: 140,
        padding: 0,
        margin: 0,
    }
})

export default class HeaderLogo extends Component {
    render() {
        return (
            <Image source={logo} style={styles.logo} />
        )
    }
}

