import { enhance } from './enhance';

/**
 * @module withDefaultAttrs
 */

/**
 * Allows the attributes to be given default values if they are undefined.
 * @function withDefaultAttrs
 * @param {Object} defaults - Object containing all the default values
 * under the attributes keys. If the value is a function, it will be called
 * with the attributes as its argument.
 * @example
 * withDefaultAttrs({
 *  foo: 'bar'
 * })(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 */
const withDefaultAttrs = defaults => component => {
    return enhance((attributes) => {
        return Object.keys(attributes).map((attr) => {
            if (defaults.hasOwnProperty(attr) && typeof(attributes[attr]) === 'undefined') 
            {
                return typeof(defaults[attr]) === 'function' ?
                    defaults[attr](attributes) : defaults[attr];
            }
            return attributes[attr];
        });
    }, component);
};

export { withDefaultAttrs };
