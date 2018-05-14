import m from 'mithril';
import { Store } from './store';

/**
 * @module bind
 */
 
/**
 * <p>
 *   Function that binds the component given to part of the state
 *   identified by the path.
 * </p>
 * <p>
 *   The component will be given one attribute when rendered;
 *   <ul>
 *     <li><b>state</b>: Contains the state obtained by this function.</li>
 *   </ul>
 * </p>
 * @function bind
 * @param {*} component - Mithril component that should be bound to the 
 * state.
 * @param {string} path - String path in the usual javascript dot notation that
 * allows the system to find the required data in the state.
 * @returns {Object} Returns a wrapper component that has all the properties
 * necessary to render the subscribed component properly.
 */
export const bind = (component, path) => {
    if (component.view == null && typeof component !== 'function')
    {
        throw new Error(`bind(component, path) expects a component, 
            not a vnode.`);
    }
    
    return {
        view: function() {
            const state = Store.find(path);
            return m(component, {state});
        },
    };
};
