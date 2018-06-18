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
export const routeComponent = {
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
 *  The first type of parameters is to render only one component for one route.
 *  If the function receives a first string parameters and a component vnode
 *  as its second, it will only render this single route/component.
 * </p>
 * <pre>
 *  r('/route', m());
 * </pre>
 * <p>
 *  The second type is an object of routes/components pairs. It will run on each
 *  pair <b>in order</b> and render the first pair where the route pattern
 *  matches the URL.
 * </p>
 * <pre>
 *  r({
 *      '/route', m(),
 *  });
 * </pre>
 * <p>
 *  This method also allows the use of a 404 route by setting a route under null
 *  or an empty string.
 * </p>
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
const r = (routes, compOrOptions, options) => {
    //If the manager hasn't yet been created
    if (!manager)
    {
        throw `The router was not initialized using 'createRouter'
            before trying to render a route.`;
    }
    //If the arguments array if smaller than 1.
    if (typeof routes == 'undefined')
    {
        //Error and return
        throw 'The \'r\' function expects at least one argument';
    }
    //If the compOrOptions argument is a component
    if (compOrOptions && compOrOptions.hasOwnProperty('tag'))
    {
        //Create the routes ourselves
        routes = {
            [routes]: compOrOptions,
        };
        if (typeof options === 'object')
        {
            //If there is also a third argument of type object
            options = options;
        }
    }
    //If instead the compOrOptions argument is an option object
    else if (typeof compOrOptions === 'object')
    {
        options = compOrOptions;
    }
    for (const route in routes)
    {
        let component = routes[route];
        if (manager.compare(route, options))
        {
            //Check if the component is actually a component VNode, if it is, clone it
            if (typeof(component) === 'object' && component.tag
                && typeof(component.tag.view) === 'function')
            {
                //Shallow dumb cloning
                return m(routeComponent, [
                    Object.assign({}, component, {
                        attrs: {
                            ...component.attrs,
                            location: Object.assign({}, 
                                manager.getLocation(),
                                { 
                                    params: manager.extractParams(route, options),
                                }
                            ),
                            params: Object.assign(
                                {},
                                manager.getState(),
                                manager.extractParams(route, options)
                            ),
                        },
                    }),
                ]);
            }
            //Maybe it just a normal vnode, render anyway
            else if (typeof(component) === 'object' && component.tag) {
                return m(routeComponent, [
                    component,
                ]);
            }
        }
    }
    //If nothing passed, return null
    return null;
};

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
 * Internal function that allows the history manager to be reset, i.e.,
 * set to undefined.
 * @methodOf module:router~r
 */
r._resetRouter = () => {
    manager = undefined;
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
        throw `The router was not initialized using 'createRouter'
            before trying to render a route.`;
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
        throw `The router was not initialized using 'createRouter'
            before trying to render a route.`;
    }
    manager.navigate(route, Object.assign({}, {
        params,
    }, options));
};

/**
 * Overloads the given vnode to add the location and route params to the
 * component's attributes. Add the location under <code>attr.location</code>
 * and the params under <code>attr.params</code>.
 * @param {string} pattern - The route pattern to extract the parameter
 * with. If the pattern has no match with the current URL, the method
 * will not be abler to add the proper parameters.
 * @param {Object} component - Component vnode that should be extended by
 * the method.
 * @param {Object} [options={}] - The options object to change the behavior
 * of the method.
 * @param {string} [options.loose=false] - Sets whether or not to return a
 * match for routes that can be compared with regexes, but are not equal.
 * For example, `/foo` and `/foo/bar` would return true with loose
 * activated.
 * @param {string} [options.caseSensitive=true] - Sets whether or not to
 * match the two routes with case sensivity.
 * @param {string} [options.strict=false] - Sets whether or not to enforce
 * an ending slash for all routes pattern.
 * @returns {object} Returns an object that will render the component with
 * the location and route parameters added to its attributes when the structure
 * fully renders.
 */
r.withLocation = (pattern, component, options) => {
    if (!manager)
    {
        throw `The router was not initialized using 'createRouter'
            before trying to render a route.`;
    }
    return {
        view: function(vnode) {
            return m(component, {
                ...vnode.attrs,
                location: Object.assign({}, 
                    manager.getLocation(),
                    { 
                        params: manager.extractParams(pattern, options),
                    }
                ),
                params: Object.assign(
                    {},
                    manager.extractParams(pattern, options)
                ),
            });
        },
    };
};

export { r };
