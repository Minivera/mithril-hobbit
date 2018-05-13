import MemoryInterface from './memoryInterface';

/**
 * @module store
 */

/**
 * The state object that will contain the state connector once the state is
 * created. Is undefined initally, any attempt to access it will result in a
 * warning.
 * @constant
 */
let state;

/**
 * Array of subscribers to the state. Whenevers a value in the state changes,
 * all subscribers in this array are notified in order as per the observer
 * pattern.
 * @constant
 */
const subscribers = [];

/**
 * Notify function that is tasked with calling the <code>notify</code> function
 * on all subscribers if that function exists on the subscriber. It passes the
 * path parameter to the subscribers when notifying them to let them know
 * what value changed.
 * @param {string} path - The path of the value that was changed during the
 * state update.
 * @function notify
 */
const notify = (path) => {
    subscribers.forEach((subscriber) => {
        if (subscriber.notify)
        {
            subscriber.notify(path);
        }
    });
};

/**
 * Store object that contains all the functions required to managed the state
 * throug the use of a compatible connector.
 * @namespace Store
 */
export const Store = {
    /**
     * Creates the store using the given connector or the default memory
     * connector if no connector is given. The initial state allows the user
     * to set the initial content of the store.
     * @param {Object} [initialState={}] - The initial state to give to the
     * connector to setup the data on the first load.
     * @param {*} [connector] - The connector to use for the state management.
     * If none is given, the default memory connector is used instead.
     * Any connector must have a set of functions described in the
     * documentation.
     * @returns {Object} Return itself for easier management and chaining.
     * @methodOf module:store~Store
     * @see [Memory connector]{@link module:memoryInterface~memoryInterface}
     */
    createStore(initialState = {}, connector = undefined) {
        //If there is not connector found
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
    /**
     * Returns the current state store inside the state connector. If the state
     * hasn't been initialized yet, a warning is displayed and the operation
     * is canceled.
     * @returns {Object|null} Return the full state or null if the state was not
     * initialized yet.
     * @methodOf module:store~Store
     */
    getState() {
        if (!state)
        {
            console.warn(`The store hasn't yet ben set for hobbit-archivist.
                Set the store using 'createStore' before trying to access it.`);
            return null;
        }
        return state.all();
    },
    /**
     * Subscribes the given subscriber object to the update on this particular
     * state store.
     * @params {*} subscriber - The object that is to act as the subject in the
     * observer pattern implementation. It should have a notify method to be
     * notified when the state changes.
     * @returns {number} Returns a key as an integer to properly identify this
     * subscriber in the array of subscribers. This key must be given to
     * [unsubscribe]{@link module:module:store~Store.unsubscribe}.
     * @methodOf module:store~Store
     * @see [unsubscribe]{@link module:module:store~Store.unsubscribe}
     */
    subscribe(subscriber) {
        return subscribers.push(subscriber) - 1;
    },
    /**
     * Unsubscribes the subscriber under the given key in the array of
     * subscribers.
     * @param {number} key - The key given by the
     * [subscribe]{@link module:module:store~Store.subscribe} function for the
     * object that needs to be unsubscribed.
     * @methodOf module:store~Store
     * @see [subscribe]{@link module:module:store~Store.subscribe}
     */
    unsubscribe(key) {
        subscribers.splice(key, 1);
    },
    /**
     * Finds the data in the state under the given path. The path should be an
     * exact path that guides to the right data written like normal dot paths.
     * @param {string} path - The path to find the data, written as a normal dot
     * notation.
     * @returns {Object} Returns the data found in the state under the given
     * path.
     * @example
     * find('path.to.the.data');
     * @methodOf module:store~Store
     */
    find(path) {
        return state.find(path);
    },
    /**
     * <p>
     *   Set the data under the given path. The path should be an
     *   exact path that guides to the right data written like normal dot paths.
     * </p>
     * <p>
     *   If the path does not exists, the function will set it to be a path of
     *   objects up to the final part.
     * </p>
     * <p>
     *   All elements that subscribe to that path or a children of the path will
     *   be notified of the change.
     * </p>
     * @param {string} path - The path to find the data, written as a normal dot
     * notation.
     * @param {*} value - The value to set at the end of the path.
     * @example
     * set('path.to.the.data', value);
     * @methodOf module:store~Store
     */
    set(path, value) {
        state.set(path, value);
        notify(path);
    },
    /**
     * Removes the data under the given path if it exists. The path should be an
     * exact path that guides to the right data written like normal dot paths.
     * Will notify all subscribers to that path or a children of that path.
     * @param {string} path - The path to find the data, written as a normal dot
     * notation.
     * @example
     * remove('path.to.the.data');
     * @methodOf module:store~Store
     */
    remove(path) {
        state.remove(path);
        notify(path);
    },
    /**
     * Resets the whole store by clearing all its values.
     */
    reset() {
        state.clear();
    },
};
