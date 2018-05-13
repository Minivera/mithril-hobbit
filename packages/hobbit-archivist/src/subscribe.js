import m from 'mithril';
import { Store } from './store';

/**
 * @module subscribe
 */

/**
 * <p>
 *   Function that subscribes the component given to part of the state
 *   identified by the path. If any part of the state including that path
 *   changes, the component returned by this functions will be notified
 *   and will trigger the <code>onstatechanged</code> method on the subscribed
 *   component with the new state.
 * </p>
 * <p>
 *   The component will be given two attributes when rendered;
 *   <ul>
 *     <li><b>state</b>: Contains the state obtained by this function.</li>
 *     <li><b>unsubscribe</b>: A function that allows the component to
 *        unsubscribe from notifications if necessary.</li>
 *   </ul>
 * </p>
 * @function subscribe
 * @param {*} component - Mithril component that should be subscribed to the 
 * state. If it includes a <code>onstatechanged</code> method, this will be
 * called whenever the system detects a change in the content of the state.
 * @param {string} path - String path in the usual javascript dot notation that
 * allows the system to find the required data in the state. It it also use for
 * subscription purposes.
 * @returns {Object} Returns a wrapper component that has all the properties
 * necessary to render the subscribed component properly.
 */
export const subscribe = (component, path) => {
    if (component.view == null && typeof component !== 'function')
    {
        throw new Error(`subscribe(component, path, store) expects a component, 
            not a vnode.`);
    }
    const state = Store.find(path);
    
    //Create the subscriber object that will be given to the store
    const subscriber = {
        notify(notifiedPath) {
            if (path.includes(notifiedPath) && component.onstatechanged)
            {
                component.onstatechanged(state, Store.find(notifiedPath));
            }
        },
    };
    
    //Subscribe to the store and keep the key
    const key = Store.subscribe(subscriber);
    //Return a new component that renders our original component with the state
    //and unsubscribe function saved up
    return {
        view: function() {
            return m(component, {
                state, 
                unsubscribe: () => {Store.unsubscribe(key)},
            });
        },
    };
};
