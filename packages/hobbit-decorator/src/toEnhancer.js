import { enhance } from './enhance';

/**
 * @module toEnhancer
 */
 
/**
 * Transforms a normal component to an ehancer so it can be used with other
 * enhancers in chained calls.
 * @function withTernary
 * @param {Object} component - The component to transform to an enhancer.
 * @example
 * toEnhancer(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 */
const toEnhancer = component => _ => enhance(attributes => attributes, component);

export { toEnhancer };
