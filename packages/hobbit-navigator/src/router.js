import m from 'mithril';
import { History } from './history';

/**
 * @module router
 */
 
/**
 * Internal variable that contains the HistoryManager for that router. It needs
 * to be created by the method <code>createRouter</code> of the <code>r</code>
 * function.
 * @constant
 * @type {History}
 * @see [History]{@link module:history~History}
 */
let manager = undefined;

/**
 * Mitrhil component used to wrap any router component. It allows the route
 * to trigger a redraw whenever the popstate event is detected on the main
 * window.
 * @namespace routeComponent
 */
const routeComponent = {
    /**
     * Lifecycle method that will trigger when the component is first created
     * and added to the DOM view. It adds an event listener to the hashchange
     * event.
     * @methodOf module:router~routeComponent
     */
    oncreate: function() {
        window.addEventListener('hashchange', this.redrawNode.bind(this));
    },
    /**
     * Lifecycle method that will trigger when the component is removed from the
     * virtual DOM and view DOM. It removes the event listener for hashchange
     * added by <code>oncreate</code>.
     * @methodOf module:router~routeComponent
     */
    onremove: function() {
        window.removeEventListener('hashchange', this.redrawNode.bind(this));
    },
    /**
     * Internal method that triggers a redraw for this vnode.
     * @methodOf module:router~routeComponent
     */
    redrawNode: function() {
        m.redraw();
    },
    /**
     * Main render method that simply renders the given children.
     * @methodOf module:router~routeComponent
     */
    view: function(vnode) {
        return vnode.children;
    },
};

/**
 * <p>
 *  Function that renders the given component according to the routes. It will
 *  check if any of the given route(s) pattern fit the current URL and render
 *  the first component where the route matches with the URL. Check the
 *  documentation for more info on route patterns. It can
 *  accept its parameters in one of two ways.
 * </p>
 * <p>
 *  The first type of parameters is to rendr only one component for one route.
 *  If the function receives a first string parameters and a component or vnode
 *  as its second, it will only render this single route/component.
 * </p>
 * <pre>
 *  r('/route', component); //To render a component
 *  //or
 *  r('/route', m()); //To render a vnode
 * </pre>
 * <p>
 *  The second type is an array of routes/components pair. It will run on each
 *  pair <b>in order</b> and render the first pair where the route pattern
 *  matches the URL.
 * </p>
 * <pre>
 *  r([
 *   ['/route', component], //To render a component
 *   ['/route', m()], //To render a vnode
 *  ]);
 * </pre>
 * <p>
 *  A final parameter can be given to pass options for comparing routes with
 *  the URL;
 *  <ul>
 *   <li><b>loose</b>: Will return a match for routes that can be compared with
 *    regexes, but are not equal. For example, `/foo` and `/foo/bar` would
 *    return true with loose activated.</li>
 *   <li><b>caseSensitive</b>: Will match the two routes with case sensivity.
 *   </li>
 *   <li><b>strict</b>: Will enforce an ending slash for all routes pattern.
 *   </li>
 *  </ul>
 * </p>
 * @returns {null|Object} Return the component if one of the given route matched
 * the URL or null if none did.
 * @function r
 * @namespace r
 */
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
        const params = routes[index][2];
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
                            ...params,
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
                    ...params,
                }),
            ]);
        }
    }
    return null;
}

/**
 * Creates the main router for the application using the given configuration
 * object. Should only be called once as recalling will invalidate prior
 * usage.
 * @param {Object} configuration - Configuration object accepted by the History
 * module.
 * @param {boolean} [configuration.hashbanged=false] - Sets whether the router
 * should set the browser url with a hashbang or not.
 * @param {string|Object} [configuration.location=null] - Sets the initial
 * route inside the route. Can either be a valid location object or a route.
 * Will not change the location in the browser.
 * @param {string} [configuration.hashbangPrefix=#!] - Sets the prefix for
 * routes when using the hashbanged option.
 * @see [History]{@link module:history~History}
 * @methodOf module:router~r
 */
r.createRouter = (configuration) => {
    manager = new History(configuration);
};

/**
 * Returns the location currently stored inside the History manager created by
 * the router.
 * @returns {Object} Returns an object contaning the location.
 * @see [getLocation]{@link module:history~History.getLocation}
 * @methodOf module:router~r
 */
r.getLocation = () => {
    if (!manager)
    {
        console.error(`The router was not initialized using 'createRouter'
            before trying to render a route.`);
        return null;
    }
    return manager.getLocation();
};

/**
 * Navigates the application to the given route patterns with the parameters.
 * Will not trigger any navigation event if navigating to the exact same route
 * as the current URL.
 * @param {string} route - The route pattern to navigate to. If parameters are
 * used in the pattern, the same parameters should be given to the params
 * object.
 * @param {Object} [params={}] - The parameters to resolve the route pattern
 * with.
 * @param {Object} [options={}] - The options to give to the navigate method of
 * the history manager.
 * @param {string} [options.sender=''] - The sender of this method. Will appear
 * in the location object.
 * @param {boolean} [options.force=false] - Forces the navigation even if
 * navigating to the exact same route. Will trigger a redraw.
 * @param {boolean} [options.options={}] - Additionnal options for the
 * navigation.
 * @param {boolean} [options.options.replace=false] - Will replace the current
 * state inside the history API rather than add a new state. Change the behavior
 * of the back button.
 * @see [navigate]{@link module:history~History.navigate}
 **/
r.navigate = (route, params = {}, options = {}) => {
    if (!manager)
    {
        console.error(`The router was not initialized using 'createRouter'
            before trying to render a route.`);
        return null;
    }
    manager.navigate(route, Object.assign({}, {
        params,
    }, options));
};

export { r };
