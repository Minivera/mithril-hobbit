import { enhance } from './enhance';

/**
 * @module withTransform
 */

/**
 * Allows the attributes of the given component to be tranformed using a
 * transformation, acting like a map on object values.
 * @function withTransform
 * @param {Object} transformators - Object containgin functions mapped under
 * the key of the attribute they should transform. Each function will receive
 * the attribute, its name and the array of attributes. It is expected to return
 * the new value for the attribute. If transformators is a function, it
 * is called with all the attributes as its parameter.
 * @example
 * withTransform({
 *  foo: (attribute, index, attributes) => `${attribute}_transformed`,
 * })(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 */
const withTransform = transformators => component => {
    return enhance((attributes) => {
        if (typeof(transformators) === 'function')
        {
            transformators = transformators(attributes);
        }
        return Object.keys(attributes).map((attr) => {
            if (transformators.hasOwnProperty(attr)) 
            {
                return transformators[attr](attributes[attr], attr, attributes);
            }
            return attributes[attr];
        });
    }, component);
};

export { withTransform };
