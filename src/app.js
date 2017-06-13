'use strict'

import axios from 'axios';
import firebase from 'firebase';
import React, { Component } from 'react';
import { StatusBar, View, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import Orientation from 'react-native-orientation';
import { persistStore, autoRehydrate } from 'redux-persist';

import App from './containers/App';
import reducers from './reducers';
import options from './config/options.json';

firebase.initializeApp(options.firebase);
axios.defaults.baseURL = options.api.base;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const store = createStore(reducers, applyMiddleware(thunk), autoRehydrate())
console.ignoredYellowBox = [
    'Animated: `useNativeDriver` is not',
    "Warning: 'keyboardShouldPersistTaps={true}' is deprecated",
]

export default class SixWinks extends Component {
    constructor() {
        super()
        this.state = { rehydrated: false }
    }
    componentWillMount() {
        Orientation.lockToPortrait();
        persistStore(store, {storage: AsyncStorage}, () => { this.setState({ rehydrated: true }) })
    }
    render() {
        if (!this.state.rehydrated) { return null }

        return (
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}
