import m from 'mithril';
import { History } from '../history';

let manager = undefined;

const routeComponent = {
    oncreate: function() {
        window.addEventListener('popstate', this.redrawNode);
    },
    onremove: function() {
        window.removeEventListener('popstate', this.redrawNode);
    },
    redrawNode: function() {
        m.redraw();
    },
    view: function(vnode) {
        return vnode.children;
    },
};

function r() {
    //Extract the arguments from the arguments object
    let routes = [];
    let options = {};
    //If the arguments array if smaller than 1.
    if (arguments.length < 1)
    {
        //Error and return
        console.error('The \'r\' function expects at least one argument');
        return null;
    }
    //If the arguments first element is an array (Thus, array of routes)
    if (arguments[0].constructor === Array)
    {
        routes = arguments[0];
        if (arguments.length > 1 && typeof(arguments[1]) === 'object')
        {
            //If there is also a second argument of type object
            options = arguments[1];
        }
    }
    else if (arguments.length > 1)
    {
        //Create the routes ourselves
        routes = [[arguments[0], arguments[1]]];
        if (arguments.length > 2 && typeof(arguments[2]) === 'object')
        {
            //If there is also a third argument of type object
            options = arguments[2];
        }
    }
    if (!manager)
    {
        console.error(`The router was not initialized using 'createRouter'
            before trying to render a route.`);
        return null;
    }
    for (const index in routes)
    {
        const route = routes[index][0];
        const component = routes[index][1];
        const attrs = routes[index][2];
        if (manager.compare(route, options))
        {
            //Check if the component is actually a VNode, if it is, clone it
            if (typeof(component) === 'object' && component.tag)
            {
                //Shallow dumb cloning
                return m(routeComponent, [
                    Object.assign({}, component, {
                        attrs: {
                            ...component.attrs,
                            location: manager.getLocation(),
                            params: Object.assign(
                                {},
                                manager.getState(),
                                manager.extractParams(route, options)
                            ),
                            ...attrs,
                        },
                    }),
                ]);
            }
            //Otherwise, make it a VNode
            return m(routeComponent, [
                m(component, {
                    location: manager.getLocation(),
                    params: Object.assign(
                        {},
                        manager.getState(),
                        manager.extractParams(route, options)
                    ),
                    ...attrs,
                }),
            ]);
        }
    }
    return null;
}

r.createRouter = (configuration) => {
    manager = new History(configuration);
};

r.getLocation = () => {
    return manager.getLocation();
};

r.navigate = (route, params = {}, options = {}) => {
    manager.navigate(route, Object.assign({}, {
        params,
    }, options));
};

export { r };