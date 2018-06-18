(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('path-to-regexp'), require('mithril')) :
  typeof define === 'function' && define.amd ? define(['path-to-regexp', 'mithril'], factory) :
  (global.HobbitNavigator = factory(null,global.Mithril));
}(this, (function (pathToRegexp,m) { 'use strict';

  pathToRegexp = pathToRegexp && pathToRegexp.hasOwnProperty('default') ? pathToRegexp['default'] : pathToRegexp;
  m = m && m.hasOwnProperty('default') ? m['default'] : m;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  /**
   * @module history
   */

  /**
   * Default configuration for the History manager.
   * @constant
   */
  var baseConfig = {
      hashbanged: false,
      location: null,
      hashbangPrefix: '#!'
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
  var checkSupport = function checkSupport(win) {
      //TODO: Make win do something in the future
      //TODO: Make these warnings hidden in production mode
      if (typeof win === 'undefined' || !win.document) {
          //If on the server, probably using SSR and should use hashbanged = true plus a basic url
          console.warn('The history API for hobbit-navigator was executed on the\n            server, if this is an expected bahavior (For example, when using SSR),\n            set the location manually to display the intended content.');
          return false;
      } else if (!win.history || !win.history.pushState) {
          console.warn('It seems you are not using a browser with HTML5 history\n            support. Hobbit-navigator will cause the page to refresh rather\n            than navigate smoothly. Use a polyfil to prevent this issue.');
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
  var History = function () {
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
      function History() {
          var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          classCallCheck(this, History);

          this.configuration = Object.assign({}, baseConfig, config);
          this.supported = checkSupport(window);
          var _configuration = this.configuration,
              hashbanged = _configuration.hashbanged,
              hashbangPrefix = _configuration.hashbangPrefix,
              location = _configuration.location;
          //Check if a location object in the configuration.

          if (location) {
              //If yes, build the location from that config depending on its type,
              //but do not redirect.
              this.location = (typeof location === 'undefined' ? 'undefined' : _typeof(location)) === 'object' ? location : {
                  path: location,
                  url: '' + (hashbanged ? hashbangPrefix : '') + location,
                  pattern: location,
                  params: {},
                  sender: ''
              };
          } else {
              //If not, build the first location from the URL.
              this.setLocationFromHref();
          }
          //Add an event listener to reset the location on hashbanged
          if (hashbanged) {
              window.addEventListener('hashchange', this.setLocationFromHref.bind(this));
          }
      }

      /**
       * Sets the location object from the current URL in the browser if
       * available. It uses a trick to extract the base URL easily by creating an
       * anchor element and using its internal logic.
       */


      History.prototype.setLocationFromHref = function setLocationFromHref() {
          var _configuration2 = this.configuration,
              hashbanged = _configuration2.hashbanged,
              hashbangPrefix = _configuration2.hashbangPrefix;

          var parser = document.createElement('a');
          parser.href = window.location.href;
          var baseUrl = hashbanged ? parser.hash.replace(hashbangPrefix, '') : parser.pathname;
          this.location = {
              path: baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl,
              url: hashbanged ? parser.hash : parser.pathname,
              pattern: baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl,
              params: this.getState(),
              sender: ''
          };
      };

      /**
       * Returns the location object stored inside the history manager.
       * @returns {Object} Return the location object.
       */


      History.prototype.getLocation = function getLocation() {
          return this.location;
      };

      /**
       * Returns the state saved in the last navigation in the history if any.
       * Will return an empty object if the history API is not supported.
       * @returns {Object} Return the state object.
       */


      History.prototype.getState = function getState() {
          return window.history.state || {};
      };

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


      History.prototype.extractParams = function extractParams(pattern) {
          var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
              _ref$loose = _ref.loose,
              loose = _ref$loose === undefined ? false : _ref$loose,
              _ref$caseSensitive = _ref.caseSensitive,
              caseSensitive = _ref$caseSensitive === undefined ? true : _ref$caseSensitive,
              _ref$strict = _ref.strict,
              strict = _ref$strict === undefined ? false : _ref$strict;

          var _executePattern = this.executePattern(this.location.path, pattern, {
              end: !loose,
              sensitive: caseSensitive,
              strict: strict
          }),
              match = _executePattern.match,
              keys = _executePattern.keys;

          if (match === null) {
              return null;
          }
          var params = match.slice(1);
          return keys.reduce(function (container, key, index) {
              container[key.name] = params[index];
              return container;
          }, {});
      };

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


      History.prototype.executePattern = function executePattern(path, pathPatterns, options) {
          var keys = [];
          var executor = pathToRegexp(pathPatterns, keys, options);
          return {
              keys: keys,
              match: executor.exec(path)
          };
      };

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


      History.prototype.navigate = function navigate(pathPatterns) {
          var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
              _ref2$params = _ref2.params,
              params = _ref2$params === undefined ? {} : _ref2$params,
              _ref2$sender = _ref2.sender,
              sender = _ref2$sender === undefined ? '' : _ref2$sender,
              _ref2$force = _ref2.force,
              force = _ref2$force === undefined ? false : _ref2$force,
              _ref2$options = _ref2.options,
              options = _ref2$options === undefined ? {} : _ref2$options;

          var replace = options.replace || false;
          //Compile the path pattern with the parameters
          var compiledPath = pathToRegexp.compile(pathPatterns);
          var path = compiledPath(params);
          //Only navigate if path are not equal
          if (!force && path === this.location.path) {
              return;
          }
          this.navigatePure(path, params, {
              sender: sender,
              replace: replace,
              pattern: pathPatterns
          });
      };

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


      History.prototype.navigatePure = function navigatePure(path) {
          var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
              _ref3$sender = _ref3.sender,
              sender = _ref3$sender === undefined ? '' : _ref3$sender,
              _ref3$replace = _ref3.replace,
              replace = _ref3$replace === undefined ? false : _ref3$replace,
              pattern = _ref3.pattern;

          var _configuration3 = this.configuration,
              hashbanged = _configuration3.hashbanged,
              hashbangPrefix = _configuration3.hashbangPrefix;

          var url = '' + (hashbanged ? hashbangPrefix : '') + path;
          if (!pattern) {
              pattern = path;
          }
          this.location = {
              path: path,
              pattern: pattern,
              url: url,
              sender: sender,
              params: state
          };
          if (this.supported) {
              if (replace) {
                  window.history.replaceState(state, null, url);
              } else {
                  window.history.pushState(state, null, url);
              }
          } else if (replace) {
              console.warn('The replace option is not available for browsers not\n                supporting the HTML5 history API.');
              return;
          } else {
              window.location.href = url;
          }
      };

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


      History.prototype.compare = function compare(pathPattern) {
          var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
              _ref4$loose = _ref4.loose,
              loose = _ref4$loose === undefined ? false : _ref4$loose,
              _ref4$caseSensitive = _ref4.caseSensitive,
              caseSensitive = _ref4$caseSensitive === undefined ? true : _ref4$caseSensitive,
              _ref4$strict = _ref4.strict,
              strict = _ref4$strict === undefined ? false : _ref4$strict;

          var _executePattern2 = this.executePattern(this.location.path, pathPattern, {
              end: !loose,
              sensitive: caseSensitive,
              strict: strict
          }),
              match = _executePattern2.match;

          if (!match) {
              return false;
          }
          var url = match[0];

          if (!loose) {
              var comparator = new RegExp(this.location.path, caseSensitive ? '' : 'i');
              return comparator.test(url);
          }
          return true;
      };

      return History;
  }();

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
  var manager = undefined;

  /**
   * Mitrhil component used to wrap any router component. It allows the route
   * to trigger a redraw whenever the popstate event is detected on the main
   * window.
   * @namespace routeComponent
   */
  var routeComponent = {
      /**
       * Lifecycle method that will trigger when the component is first created
       * and added to the DOM view. It adds an event listener to the hashchange
       * event.
       * @methodOf module:router~routeComponent
       */
      oncreate: function oncreate() {
          window.addEventListener('hashchange', this.redrawNode.bind(this));
      },
      /**
       * Lifecycle method that will trigger when the component is removed from the
       * virtual DOM and view DOM. It removes the event listener for hashchange
       * added by <code>oncreate</code>.
       * @methodOf module:router~routeComponent
       */
      onremove: function onremove() {
          window.removeEventListener('hashchange', this.redrawNode.bind(this));
      },
      /**
       * Internal method that triggers a redraw for this vnode.
       * @methodOf module:router~routeComponent
       */
      redrawNode: function redrawNode() {
          m.redraw();
      },
      /**
       * Main render method that simply renders the given children.
       * @methodOf module:router~routeComponent
       */
      view: function view(vnode) {
          return vnode.children;
      }
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
  var r = function r(routes, compOrOptions, options) {
      //If the manager hasn't yet been created
      if (!manager) {
          throw 'The router was not initialized using \'createRouter\'\n            before trying to render a route.';
      }
      //If the arguments array if smaller than 1.
      if (typeof routes == 'undefined') {
          //Error and return
          throw 'The \'r\' function expects at least one argument';
      }
      //If the compOrOptions argument is a component
      if (compOrOptions && compOrOptions.hasOwnProperty('tag')) {
          var _routes;

          //Create the routes ourselves
          routes = (_routes = {}, _routes[routes] = compOrOptions, _routes);
          if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
              //If there is also a third argument of type object
              options = options;
          }
      }
      //If instead the compOrOptions argument is an option object
      else if ((typeof compOrOptions === 'undefined' ? 'undefined' : _typeof(compOrOptions)) === 'object') {
              options = compOrOptions;
          }
      for (var route in routes) {
          var component = routes[route];
          if (manager.compare(route, options)) {
              //Check if the component is actually a component VNode, if it is, clone it
              if ((typeof component === 'undefined' ? 'undefined' : _typeof(component)) === 'object' && component.tag && typeof component.tag.view === 'function') {
                  //Shallow dumb cloning
                  return m(routeComponent, [Object.assign({}, component, {
                      attrs: _extends({}, component.attrs, {
                          location: Object.assign({}, manager.getLocation(), {
                              params: manager.extractParams(route, options)
                          }),
                          params: Object.assign({}, manager.getState(), manager.extractParams(route, options))
                      })
                  })]);
              }
              //Maybe it just a normal vnode, render anyway
              else if ((typeof component === 'undefined' ? 'undefined' : _typeof(component)) === 'object' && component.tag) {
                      return m(routeComponent, [component]);
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
  r.createRouter = function (configuration) {
      manager = new History(configuration);
  };

  /**
   * Internal function that allows the history manager to be reset, i.e.,
   * set to undefined.
   * @methodOf module:router~r
   */
  r._resetRouter = function () {
      manager = undefined;
  };

  /**
   * Returns the location currently stored inside the History manager created by
   * the router.
   * @returns {Object} Returns an object contaning the location.
   * @see [getLocation]{@link module:history~History.getLocation}
   * @methodOf module:router~r
   */
  r.getLocation = function () {
      if (!manager) {
          throw 'The router was not initialized using \'createRouter\'\n            before trying to render a route.';
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
  r.navigate = function (route) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (!manager) {
          throw 'The router was not initialized using \'createRouter\'\n            before trying to render a route.';
      }
      manager.navigate(route, Object.assign({}, {
          params: params
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
  r.withLocation = function (pattern, component, options) {
      if (!manager) {
          throw 'The router was not initialized using \'createRouter\'\n            before trying to render a route.';
      }
      return {
          view: function view(vnode) {
              return m(component, _extends({}, vnode.attrs, {
                  location: Object.assign({}, manager.getLocation(), {
                      params: manager.extractParams(pattern, options)
                  }),
                  params: Object.assign({}, manager.extractParams(pattern, options))
              }));
          }
      };
  };

  return r;

})));
