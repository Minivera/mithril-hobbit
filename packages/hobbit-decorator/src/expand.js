/**
 * @module expand
 */

/**
 * <p>
 *  Allows the monkey patching of functions of a component. Can be useful to
 *  run multiple instances of the same lifecycle method.
 * </p>
 * <p>
 *  If the expander function returns a value, the original
 *  function will receive the returned value as its last argument.
 * </p>
 * @function expand
 * @param {Object} expander - Object containing the function to expand under
 * the function's name.
 * @example
 * expand({
 *  onupdate: function,
 * })(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 */
function expand(expander) { //Normal function as rollup cannot handle this with arrow functions
    return function(component) {
        for (let func in expander) 
        {
            //Make sure the prop is not inherited and is a function
            if (expander.hasOwnProperty(func) && typeof(expander[func]) === 'function') 
            {
                const original = component[func];
                component = Object.assign({}, component, {
                    [func]: (...args) => {
                        const result = expander[func].apply(this, args);
                        original.apply(this, args.concat(result));
                    },
                });
            }
        }
        return component;
    };
}

export { expand };
