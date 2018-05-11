import MemoryInterface from './memoryInterface';

let state;
const subscribers = [];

const notify = (path) => {
    subscribers.forEach((subscriber) => {
        if (subscriber.notify)
        {
            subscriber.notify(path);
        }
    });
};

export const Store = {
    createStore(initialState = {}, connector) {
        //If there is not connecteor found
        if (!connector)
        {
            //Create the basic memory connector
            state = new MemoryInterface(initialState);
        }
        else
        {
            //Create the state with the connecter, you better hope its a constructor!
            state = new connector(initialState);
        }
        return this;
    },
    getState() {
        if (!state)
        {
            console.warn(`The store hasn't yet ben set for hobbit-archivist.
                Set the store using 'createStore' before trying to access it.`);
            return null;
        }
        return state.all();
    },
    subscribe(subscriber) {
        return subscribers.push(subscriber);
    },
    unsubscribe(key) {
        subscribers.splice(key, 1);
    },
    find(path) {
        return state.find(path);
    },
    set(path, value) {
        state.set(path, value);
        notify(path);
    },
    remove(path) {
        state.remove(path);
        notify(path);
    },
    reset() {
        state.clear();
    },
};
