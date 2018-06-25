import { enhance } from './enhance';

/**
 * @module withHandle
 */

/**
 * Adds the given set of functions to the attributes of the component.
 * @function withHandle
 * @param {Object} handlers - Object containing all the handler functions to
 * add to the attributes. All functions are called with their arguments
 * and the component as their this. If handlers is a function, it is called with
 * all the attributes as its parameter.
 * @example
 * withHandle({
 *  onChange: args => { //do something },
 * })(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 */
const withHandle = handlers => component => {
    return enhance((attributes) => {
        if (typeof(handlers) === 'function')
        {
            handlers = handlers(attributes);
        }
        return Object.assign({},
            attributes,
            Object.keys(handlers).map((attr) => {
                return (args) =>
                    handlers[attr].apply(component, args);
            })
        );
    }, component);
};

export { withHandle };
