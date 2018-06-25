import { enhance } from './enhance';

/**
 * @module withAttrsRename
 */

/**
 * Allows the attributes of the given component to be renamed using an object
 * or new names.
 * @function withAttrsRename
 * @param {Object} renames - Object where the keys are the original names and
 * the values the new name to give to that attribute. If a value is a function,
 * will be called with the attributes as its parameters.
 * @example
 * withAttrsRename({
 *  original: 'renamed',
 * })(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 */
const withAttrsRename = renames => component => {
    return enhance((attributes) => {
        const newAttrs = {};
        Object.keys(attributes).forEach((attr) => {
            if (renames.hasOwnProperty(attr)) 
            {
                if (typeof(renames[attr]) === 'function')
                {
                    newAttrs[renames[attr](attributes)] = attributes[attr];
                    return;
                }
                newAttrs[renames[attr]] = attributes[attr];
                return;
            }
            newAttrs[attr] = attributes[attr];
        });
        return newAttrs;
    }, component);
};

export { withAttrsRename };
