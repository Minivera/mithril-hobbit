/**
 * @module compose
 */

/**
 * Compose multiple enhancers together to reduce nesting an simplify how
 * components can be enhanced. When using, function are executed from
 * top to bottom, so attributes propagate this way too.
 * @function compose
 */
const compose = (...functions) =>
    functions.reduce((func1, func2) =>
        (...args) => func1(func2(...args)), arg => arg);

export { compose };
