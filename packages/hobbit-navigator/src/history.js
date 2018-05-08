import pathToRegexp from 'path-to-regexp';

/**
 * @module history
 */
 
/**
 * Default configuration for the History manager.
 * @constant
 */
const baseConfig = {
    hashbanged: false,
    location: null,
    hashbangPrefix: '#!',
};

/**
 * <p>
 *  Function that checks if the browser supports the history API is supported by
 *  the current browser or not. It will also trigger warnings in the browser's
 *  console depending on the detected support.
 * </p>
 * <p>
 *  The function can detect if it is called on an unsupported browser or the
 *  server.
 * </p>
 * @returns {boolean} Whether the html5 history API is supported or not.
 * @function checkSupport
 */
const checkSupport = () => {
    //TODO: Make these warnings hidden in production mode
    if (typeof window === 'undefined' || !window.document)
    {
        //If on the server, probably using SSR and should use hashbanged = true plus a basic url
        console.warn(`The history API for hobbit-navigator was executed on the
            server, if this is an expected bahavior (For example, when using SSR),
            set the location manually to display the intended content.`);
        return false;
    }
    else if (!window.history || !window.history.pushState) 
    {
        console.warn(`It seems you are not using a browser with HTML5 history
            support. Hobbit-navigator will cause the page to refresh rather
            than navigate smoothly. Use a polyfil to prevent this issue.`);
        return false;
    }
    return true;
};

/**
 * Main class for the history manager.
 * @class
 * @typedef History
 * @property {Object} configuration - The configuration object stored inside the
 * class. Built from the constructor and the
 * [default configuration]{@link module:history~baseConfig}.
 * @property {boolean} supported - Whether or not the HTMl5 history API is
 * supported by the current browser or not using the
 * [checkSupport]{@link module:history~checkSupport} function.
 * @property {Object} location - The location object containing data relative
 * to the last navigation.
 * @property {string} location.path - Contains the path of the last navigation.
 * @property {string} location.url - Is the true url that was navigated to,
 * including any query string arguments or the hashbang prefix.
 * @property {string} location.pattern - Is the route pattern that was used by
 * the last navigation to create the path.
 * @property {Object} location.params - Is the parameters object that was given
 * in the last navigation to create the path from the pattern.
 * @property {string} location.sender - Is the sender of the last navigation.
 * @requires path-to-regexp
 * @see [default configuration]{@link module:history~baseConfig}
 * @see [checkSupport]{@link module:history~checkSupport}
 * @see [path-to-regexp]{@link https://github.com/pillarjs/path-to-regexp}
 */
export class History {
    /**
     * Constructor for the history manager that sets the configuration from
     * the parameter and the base configuration available in the module.
     * @param {Object} [config={}] - Configuration that may overwrite the
     * default configuration of the module.
     * @param {boolean} [config.hashbanged=false] - Sets whether the router
     * should set the browser url with a hashbang or not.
     * @param {string|Object} [config.location=null] - Sets the initial
     * route inside the route. Can either be a valid location object or a route.
     * Will not change the location in the browser.
     * @param {string} [config.hashbangPrefix=#!] - Sets the prefix for
     * routes when using the hashbanged option.
     */
    constructor(config = {}) {
        this.configuration = Object.assign({}, baseConfig, config);
        this.supported = checkSupport();
        const { hashbanged, hashbangPrefix, location } = this.configuration;
        //Check if a location object in the configuration.
        if (location)
        {
            //If yes, build the location from that config depending on its type,
            //but do not redirect.
            this.location = typeof(location) === 'object' ? location : {
                path: location,
                url: `${hashbanged ? hashbangPrefix : ''}${location}`,
                pattern: location,
                params: {},
                sender: '',
            };
        }
        else
        {
            //If not, build the first location from the URL.
            this.setLocationFromHref();
        }
        //Add an event listener to reset the location on hashbanged
        if (hashbanged)
        {
            window.addEventListener(
                'hashchange', 
                this.setLocationFromHref.bind(this)
            );
        }
    }
    
    /**
     * Sets the location object from the current URL in the browser if
     * available. It uses a trick to extract the base URL easily by creating an
     * anchor element and using its internal logic.
     */
    setLocationFromHref() {
        const { hashbanged, hashbangPrefix } = this.configuration;
        const parser = document.createElement('a');
        parser.href = window.location.href;
        const baseUrl = hashbanged ? parser.hash.replace(hashbangPrefix, '')
            : parser.pathname;
        this.location = {
            path: baseUrl,
            url: hashbanged ? parser.hash : parser.pathname,
            pattern: baseUrl,
            params: {},
            sender: '',
        };
    }
    
    /**
     * Returns the location object stored inside the history manager.
     * @returns {Object} Return the location object.
     */
    getLocation() {
        return this.location;
    }
    
    /**
     * Returns the state saved in the last navigation in the history if any.
     * Will return an empty object if the history API is not supported.
     * @returns {Object} Return the state object.
     */
    getState() {
        return window.history.state || {};
    }
    
    /**
     * Extracts the parameters using the pattern from the url to ensure the
     * parameter are set even if not stored inside the state when navigating.
     * @param {string} pattern - The route pattern to extract the parameter
     * with. If the pattern has no match with the current URL, the methode
     * will simply return null.
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
     * @returns {Object|null} Returns the extracted parameters as an object if
     * any could be found or null if none are available or a match was
     * impossible.
     */
    extractParams(pattern, {loose = false, caseSensitive = true, strict = false} = {}) {
        const { match, keys } = this.executePattern(
            this.location.path,
            pattern,
            { 
                end: !loose,
                sensitive: caseSensitive,
                strict,
            }
        );
        if (match === null)
        {
            return null;
        }
        const params = match.slice(1);
        return keys.reduce((container, key, index) => {
            container[key.name] = params[index];
            return container;
        }, {});
    }
    
    /**
     * Execute the given pattern with the extracted options. It will create a
     * match object if the pattern matched the path and create an array of keys
     * for the parameters of the pattern.
     * @param {string} path - The string path to compare with the pattern.
     * @param {string} pathPatterns - The path pattern to use for the
     * comparaison. If the pattern contains any parameters, they will be
     * extracted from the path.
     * @param {Object} options - The options object to pass to path-to-regex
     * that ensures the comparaison is done as expected.
     * @returns {Object} Returns the match and parameters keys in an object.
     * @see [path-to-regexp]{@link https://github.com/pillarjs/path-to-regexp}
     */
    executePattern(path, pathPatterns, options) {
        const keys = [];
        const executor = pathToRegexp(pathPatterns, keys, options);
        return {
            keys,
            match: executor.exec(path),
        };
    }
    
    /**
     * Navigates the browser to the given path pattern using the parameters and
     * the options given.
     * @param {string} pathPatterns - The string pattern to navigate to. If
     * named parameters are used, the should appear in the params options to
     * resolve them.
     * @param {Object} [options={}] - The options object to configure the
     * behavior of the method.
     * @param {Object} [options.params={}] - The parameters to resolve the
     * route pattern with.
     * @param {string} [options.sender=''] - The sender of this method. Will
     * appear in the location object.
     * @param {boolean} [options.force=false] - Forces the navigation even if
     * navigating to the exact same route. Will trigger a redraw.
     * @param {boolean} [options.options={}] - Additionnal options for the
     * navigation.
     * @param {boolean} [options.options.replace=false] - Will replace the current
     * state inside the history API rather than add a new state. Changes the
     * behavior of the back button.
     */
    navigate(pathPatterns, {params = {}, sender = '', force = false, options = {}} = {}) {
        const replace = options.replace || false;
        //Compile the path pattern with the parameters
        const compiledPath = pathToRegexp.compile(pathPatterns);
        const path = compiledPath(params);
        //Only navigate if path are not equal
        if (!force && path === this.location.path)
        {
            return;
        }
        this.navigatePure(path, params, {
            sender,
            replace,
            pattern: pathPatterns,
        });
    }
    
    /**
     * Navigates the browser window to the pure path given by using the HTML5
     * history API if possible. If the browser does not support the HTML 5 API,
     * it will cause a location change which will refresh the page.
     * @param {string} path - The pure path to navigate to. It should not
     * contain any special chars like path patterns do.
     * @param {Object} state - The parameters of the navigation to save inside
     * the history state.
     * @param {Object} [options={}] - The options object to configure the
     * behavior of the method.
     * @param {string} [options.sender=''] - The sender of this method. Will
     * appear in the location object.
     * @param {boolean} [options.replace=false] - Will replace the current
     * state inside the history API rather than add a new state. Changes the
     * behavior of the back button.
     * @param {string} options.pattern - Additionnal options for the
     * navigation.
     */
    navigatePure(path, state, {sender = '', replace = false, pattern} = {}) {
        const { hashbanged, hashbangPrefix } = this.configuration;
        const url = `${hashbanged ? hashbangPrefix : ''}${path}`;
        if (!pattern)
        {
            pattern = path;
        }
        this.location = {
            path: path,
            pattern,
            url,
            sender,
            params: state,
        };
        if (this.supported)
        {
            if (replace)
            {
                window.history.replaceState(state, null, url);
            }
            else 
            {
                window.history.pushState(state, null, url);
            }
        }
        else if (replace)
        {
            console.warn(`The replace option is not available for browsers not
                supporting the HTML5 history API.`);
            return;
        }
        else
        {
            window.location.href = url;
        }
    }
    
    /**
     * Compares the current URL with the given path pattern to see if there is
     * a match between the two.
     * @param {string} pathPatterns - The string pattern used to compare using
     * pat-to-regexp.
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
     * @returns {boolean} Returns whether or not there is a match between the
     * given pattern and the URL depending on the options.
     * @see [path-to-regexp]{@link https://github.com/pillarjs/path-to-regexp}
     */
    compare(pathPattern, {loose = false, caseSensitive = true, strict = false} = {}) {
        const { match } = this.executePattern(
            this.location.path,
            pathPattern,
            { 
                end: !loose,
                sensitive: caseSensitive,
                strict,
            }
        );
        if (!match)
        {
            return false;
        }
        const [ url ] = match;
        if (!loose)
        {
            const comparator = new RegExp(
                this.location.path, 
                caseSensitive ? '' : 'i'
            );
            return comparator.test(url);
        }
        return true;
    }
}
