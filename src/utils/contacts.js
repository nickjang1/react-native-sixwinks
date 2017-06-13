import Promise from 'bluebird';
import Contacts from 'react-native-contacts';

export function getPhonebookContacts() {
    return new Promise(function(resolve, reject) {
        Contacts.getAll(function(error, phoneBookContacts) {
            (error) ? reject('Unable to read phonebook contacts') : resolve(phoneBookContacts)
        })
    })
}

export async function processPhonebookContacts(phoneBookContacts, myNumber, prefix) {
    let contacts = [];
    _.forEach(phoneBookContacts, function(contact) {
        let contactName     = guessContactName(contact);

        _.forEach(contact.phoneNumbers, function(phoneNumber) {

            // strip spaces all characters except +
            let number = processPhoneNumber(phoneNumber.number, prefix)


            //filter out blank numbers
            //filter out my own number
            if (number != "" && number != myNumber){
                let newContact = {name: contactName, selected: false, number: number, id:contactName + " " + number};
                contacts.push(newContact);
            }
        });
    });

    contacts = _.sortBy(contacts, 'name');
    contacts = _.keyBy(contacts, "id");
    return Promise.resolve(contacts);
}

// guess/construct contact's display name
function guessContactName(contact) {
    let contactName = '';
    if(contact.givenName) { contactName += `${contact.givenName}` }
    if(contact.middleName) { contactName += ` ${contact.middleName}` }
    if(contact.familyName) { contactName += ` ${contact.familyName}` }
    return contactName;
}

// Process phone number and add country code if needed
function processPhoneNumber(phoneNumber, prefix) {
    phoneNumber = phoneNumber.replace(/[^+\d]+/g, '')

    if (_.startsWith(phoneNumber, '+')) {
        return phoneNumber
    } else if (_.startsWith(phoneNumber, '0') && phoneNumber.length === 10) {
        return _.replace(phoneNumber, new RegExp('^0'), prefix)
    } else {
        return phoneNumber
    }
}
