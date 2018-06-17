import m from 'mithril';

/**
 * @module withTernary
 */

/**
 * Allows to execute a kind-of ternary operator on two hocs to chose which
 * one to apply on the given component. If the condition is true, the first
 * hoc will be applied, otherwise the second will.
 * @function withTernary
 * @param {funtion} condition - Function to use as the condition.
 * @param {funtion} firstComp - Component to render as an hoc to the main
 * component if the condition is true.
 * @param {funtion} secondComp - Component to render as an hoc to the main
 * component if the condition is false.
 * @example
 * withTernary(withHandler(...), withState(...))(component);
 * @returns {function} Returns a closure function that takes the component
 * as its argument so it can be easily composed.
 */
const withTernary = (condition, firstComp, secondComp = null) => component => ({
    view: function(vnode) {
        const enhancer = condition(vnode.attrs) ? firstComp : secondComp;
        return enhancer(m(component, vnode.attrs));
    },
});

export { withTernary };
