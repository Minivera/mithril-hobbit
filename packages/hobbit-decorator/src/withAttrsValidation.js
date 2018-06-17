import { enhance } from './enhance';

/**
 * @module withAttrsRename
 */

/**
 * Allows the attributes to be validated against a set of function for
 * each attribute. Will trigger a warning in the console when an attribute
 * does not comply with the validation.
 * @function withAttrsValidation
 * @param {Object} validators - Object containing all the validation functions
 * under the attributes keys. Each function will receive the attribute, the
 * attrribute name and all attributes as parameters and expect a boolean
 * in return.
 * @example
 * withAttrsValidation({
 *  foo: (value, name) => value === 'bar'
 * })(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 * @todo Allow message customization
 */
const withAttrsValidation = validators => component => {
    return enhance((attributes) => {
        for (let attr in attributes) 
        {
            //Make sure the prop is not inherited and is a function
            if (attributes.hasOwnProperty(attr) && validators.hasOwnProperty(attr)
                && !validators[attr](attributes[attr], attr, attributes)) 
            {
                console.error(`Failed validation on the attribute '${attr}'`);
            }
        }
        return attributes;
    }, component);
};

export { withAttrsValidation };
