import m from 'mithril';

export const bind = (component, path, store) => {
    if (component.view == null && typeof component !== 'function')
    {
        throw new Error(`bind(component, path, store) expects a component, 
            not a vnode.`);
    }
    
    const state = store.find(path);
    return {
        view: function() {
            return m(component, {state});
        },
    };
};
