const initialState = []

export default function reducer(state = initialState, action) {
    console.log(new Date() + action.type)
    switch (action.type) {
        case 'UPDATE_CONTACTS':
            return action.payload.contacts
        default:
            return state;
    }
}
