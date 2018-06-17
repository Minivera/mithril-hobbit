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
        const newAttrs = {};
        for (let attr in attributes) 
        {
            //Make sure the prop is not inherited and is a function
            if (attributes.hasOwnProperty(attr) && defaults.hasOwnProperty(attr)
                && typeof(attributes[attr]) === 'undefined') 
            {
                newAttrs[attr] = typeof(defaults[attr]) === 'function' ?
                    defaults[attr](attributes) : defaults[attr];
            }
        }
        return Object.assign({},
            attributes,
            newAttrs
        );
    }, component);
};

export { withDefaultAttrs };
