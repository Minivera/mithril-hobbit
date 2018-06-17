import m from 'mithril';

/**
 * @module enhance
 */
 
/**
 * Enhance the component given in paramters with the enhancer function.
 * Acts as a closure component so the structure is not affected by the
 * enhancement and the return value can be properly nested.
 * @function enhance
 * @param {function} enhancer - Function that will act on the attributes
 * the closure components receive to modify them and give them to the
 * rendered component.
 * @param {Object} component - Component to render once its attributes
 * have been enhanced.
 * @returns {Object} Returns a component object that can be rendered by
 * mithril with all the attributes enhanced.
 */
const enhance = (enhancer, component) => ({
    view: function(vnode) {
        return m(component, {
            ...enhancer(vnode.attrs, vnode),
        });
    },
});
 
export { enhance };
 