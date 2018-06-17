import { enhance } from './enhance';

/**
 * @module withState
 */

/**
 * Adds the given state value and state set function to teh attributes. The
 * setter does not handle redraw as mithril does a pretty good job with it
 * already.
 * @function withState
 * @param {string} valueName - The name of the state value ot keep alive
 * in this external state machine.
 * @param {string} setterName - The name of the stter function to use to
 * set the state of that component.
 * @param {*} initialState - Initial value of the state.
 * @example
 * withState('foo', 'setFoo')(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 */
const withState = (valueName, setterName, initialState = null) => component => {
    let state = initialState;
    return enhance((attributes) => {
        return Object.assign({},
            attributes,
            {
                [valueName]: state,
                [setterName]: (newValue) => state = newValue,
            }
        );
    }, component);
};

export { withState };
