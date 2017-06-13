import {getPhonebookContacts, processPhonebookContacts} from '../utils/contacts'
import {requestContactsPermission} from '../utils/permissions';

export function updateContacts(user) {
    return function(dispatch) {
        buildContactsFromPhonebook(user, dispatch);
    }
}

export async function buildContactsFromPhonebook(user, dispatch) {
    if (await requestContactsPermission()) {
        try {
            let myNumber          = user.phoneNumber;
            let prefix            = user.prefix;
            let phoneBookContacts = await getPhonebookContacts();
            let contacts          = await processPhonebookContacts(phoneBookContacts, myNumber, prefix);

            dispatch({ type: 'UPDATE_CONTACTS', payload: { contacts: contacts } })
        } catch(error) {
            console.log(error)
        }
    }
}
