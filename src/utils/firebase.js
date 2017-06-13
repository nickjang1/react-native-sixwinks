import Promise from 'bluebird';
import firebase from 'firebase';

const firebaseService = {
    token: function () {
        return new Promise(function(resolve, reject) {
            firebase.auth().onAuthStateChanged(function(user) {
                if(!user) { reject('User not logged in to firebase') }
                firebase.auth().currentUser.getToken(true).then(function(idToken) {
                    resolve(idToken)
                })
            })
        })
    },
    user: function () {
        return new Promise(function(resolve, reject) {
            firebase.auth().onAuthStateChanged(function(user) {
                if(!user) { reject('User not logged in to firebase') }
                resolve(user);
            })
        })
    },
}
module.exports = firebaseService;
