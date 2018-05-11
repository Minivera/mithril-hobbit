import m from 'mithril';

export const subscribe = (component, path, store) => {
    if (component.view == null && typeof component !== 'function')
    {
        throw new Error(`subscribe(component, path, store) expects a component, 
            not a vnode.`);
    }
    
    //Create the subscriber object that will be given to the store
    const subscriber = {
        notify(notifiedPath) {
            if (notifiedPath === path && component.onstatechanged)
            {
                component.onstatechanged(store.find(notifiedPath));
            }
        },
    };
    
    //Subscribe to the store and keep the key
    const key = store.subscribe(subscriber) - 1;
    //Return a new component that renders our original component with the state
    //and unsubscribe function saved up
    return {
        view: function() {
            return m(component, {
                state: store.find(path), 
                unsubscribe: () => {store.unsubscribe(key)},
            });
        },
    };
};
