(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('mithril')) :
  typeof define === 'function' && define.amd ? define(['exports', 'mithril'], factory) :
  (factory((global.HobbitNavigator = {}),global.Mithril));
}(this, (function (exports,m) { 'use strict';

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

  /**
   * @module memoryInterface
   */

  /**
   * Helper function that sets a value recursively inside an object without
   * mutating the original object.
   * @function setRecursively
   * @param {Object} object - The object to set recursively, will be changed
   * for the recursive searched element in the object tree during recursion.
   * @param {Array<string>} pathParts - An array of strings that represent the
   * path to follow inside the nested tree of objects. Will be slowly sliced
   * during recursion.
   * @param {*} value - The value to set at the end of the recursive path.
   * @returns {Object} Returns the original object cloned and updated with
   * the new value.
   */
  var setRecursively = function setRecursively(object, pathParts, value) {
      var _Object$assign2;

      //Make sure the property is an object
      if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object') {
          //Ends recursivity, we don't want to overwrite non objects
          return object;
      }
      //Make sure the property actually exists
      if (!object.hasOwnProperty(pathParts[0])) {
          var _Object$assign;

          object = Object.assign({}, object, (_Object$assign = {}, _Object$assign[pathParts[0]] = {}, _Object$assign));
      }
      //Continue with the resursivity without mutating
      return Object.assign({}, object, (_Object$assign2 = {}, _Object$assign2[pathParts[0]] = pathParts.length > 1 ? setRecursively(object[pathParts[0]], pathParts.slice(1), value) : value, _Object$assign2));
  };

  /**
   * Interface that exposes all the required methods to work as a connector
   * for the state store.
   * @class
   * @property {Object} data - The data stored inside memory for the state
   * management.
   */

  var memoryInterface = function () {
      /**
       * Constructor that set the internal data with the initialData if any.
       * @param {Object} [initialData={}] - The initial state to store when
       * creating this interface.
       */
      function memoryInterface() {
          var initialData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          classCallCheck(this, memoryInterface);

          this.data = initialData;
      }

      /**
       * Sets a value under the given path in the state. If the path does not
       * exist, it will be created as a path of objects.
       * @param {string} path - The path where the value is located, must
       * be a string using the usual dot notation for javascript.
       * @param {*} value - The value to set a the end of the path.
       * @see [setRecursively]{@link module:memoryInterface~setRecursively}
       */


      memoryInterface.prototype.set = function set$$1(path, value) {
          this.data = setRecursively(this.data, path.split('.'), value);
      };

      /**
       * Removes a value under the given path in the state. It removes the value
       * by setting it as undefined.
       * @param {string} path - The path where the value is located, must
       * be a string using the usual dot notation for javascript.
       * @see [setRecursively]{@link module:memoryInterface~setRecursively}
       */


      memoryInterface.prototype.remove = function remove(path) {
          this.data = setRecursively(this.data, path.split('.'), undefined);
      };

      /**
       * Finds a value under the given path in the state. I will follow the path
       * as long as it exists and will return immeditatly if the path does not
       * exists.
       * @param {string} path - The path where the value is located, must
       * be a string using the usual dot notation for javascript.
       * @returns {*} Returns the found value or undefined if it could not be
       * found.
       */


      memoryInterface.prototype.find = function find(path) {
          var value = this.data;
          //Split the path into its parts if it is a valid path
          var parts = path.split('.');
          //Go through all parts
          for (var part in parts) {
              part = parts[part];
              //If the part can be found
              if (value[part]) {
                  //Continue deeper
                  value = value[part];
              } else {
                  //Else, cancel the search
                  return undefined;
              }
          }
          //Return the latest found value
          return value;
      };

      /**
       * Clears the memory state by replacing the old state with an empty object.
       */


      memoryInterface.prototype.clear = function clear() {
          this.data = {};
      };

      /**
       * Returns all the content currently stored inside the state.
       * @returns {Object} Returns the object store in memory.
       */


      memoryInterface.prototype.all = function all() {
          return this.data;
      };

      return memoryInterface;
  }();

  /**
   * @module store
   */

  /**
   * The state object that will contain the state connector once the state is
   * created. Is undefined initally, any attempt to access it will result in a
   * warning.
   * @constant
   */
  var state = void 0;

  /**
   * Array of subscribers to the state. Whenevers a value in the state changes,
   * all subscribers in this array are notified in order as per the observer
   * pattern.
   * @constant
   */
  var subscribers = [];

  /**
   * Notify function that is tasked with calling the <code>notify</code> function
   * on all subscribers if that function exists on the subscriber. It passes the
   * path parameter to the subscribers when notifying them to let them know
   * what value changed.
   * @param {string} path - The path of the value that was changed during the
   * state update.
   * @function notify
   */
  var notify = function notify(path) {
      subscribers.forEach(function (subscriber) {
          if (subscriber.notify) {
              subscriber.notify(path);
          }
      });
  };

  /**
   * Store object that contains all the functions required to managed the state
   * throug the use of a compatible connector.
   * @namespace Store
   */
  var Store = {
      /**
       * Creates the store using the given connector or the default memory
       * connector if no connector is given. The initial state allows the user
       * to set the initial content of the store.
       * @param {Object} [initialState={}] - The initial state to give to the
       * connector to setup the data on the first load.
       * @param {*} [connector] - The connector to use for the state management.
       * If none is given, the default memory connector is used instead.
       * Any connector must have a set of functions described in the
       * documentation.
       * @returns {Object} Return itself for easier management and chaining.
       * @methodOf module:store~Store
       * @see [Memory connector]{@link module:memoryInterface~memoryInterface}
       */
      createStore: function createStore() {
          var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var connector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

          //If there is not connector found
          if (!connector) {
              //Create the basic memory connector
              state = new memoryInterface(initialState);
          } else {
              //Create the state with the connecter, you better hope its a constructor!
              state = new connector(initialState);
          }
          return this;
      },


      /**
       * Internal method that resets the store to undefined.
       * @returns {Object} Return itself for easier management and chaining.
       * @methodOf module:store~Store
       */
      _resetStore: function _resetStore() {
          state = undefined;
          return this;
      },


      /**
       * Returns the current state store inside the state connector. If the state
       * hasn't been initialized yet, a warning is displayed and the operation
       * is canceled.
       * @returns {Object|null} Return the full state or null if the state was not
       * initialized yet.
       * @methodOf module:store~Store
       */
      getState: function getState() {
          if (!state) {
              throw 'The store hasn\'t yet ben set for hobbit-archivist.\n                Set the store using \'createStore\' before trying to access it.';
          }
          return state.all();
      },


      /**
       * Subscribes the given subscriber object to the update on this particular
       * state store.
       * @params {*} subscriber - The object that is to act as the subject in the
       * observer pattern implementation. It should have a notify method to be
       * notified when the state changes.
       * @returns {number} Returns a key as an integer to properly identify this
       * subscriber in the array of subscribers. This key must be given to
       * [unsubscribe]{@link module:module:store~Store.unsubscribe}.
       * @methodOf module:store~Store
       * @see [unsubscribe]{@link module:module:store~Store.unsubscribe}
       */
      subscribe: function subscribe(subscriber) {
          return subscribers.push(subscriber) - 1;
      },


      /**
       * Unsubscribes the subscriber under the given key in the array of
       * subscribers.
       * @param {number} key - The key given by the
       * [subscribe]{@link module:module:store~Store.subscribe} function for the
       * object that needs to be unsubscribed.
       * @methodOf module:store~Store
       * @see [subscribe]{@link module:module:store~Store.subscribe}
       */
      unsubscribe: function unsubscribe(key) {
          subscribers.splice(key, 1);
      },


      /**
       * Finds the data in the state under the given path. The path should be an
       * exact path that guides to the right data written like normal dot paths.
       * @param {string} path - The path to find the data, written as a normal dot
       * notation.
       * @returns {Object} Returns the data found in the state under the given
       * path.
       * @example
       * find('path.to.the.data');
       * @methodOf module:store~Store
       */
      find: function find(path) {
          if (!state) {
              throw 'The store hasn\'t yet ben set for hobbit-archivist.\n                Set the store using \'createStore\' before trying to access it.';
          }
          return state.find(path);
      },


      /**
       * <p>
       *   Set the data under the given path. The path should be an
       *   exact path that guides to the right data written like normal dot paths.
       * </p>
       * <p>
       *   If the path does not exists, the function will set it to be a path of
       *   objects up to the final part.
       * </p>
       * <p>
       *   All elements that subscribe to that path or a children of the path will
       *   be notified of the change.
       * </p>
       * @param {string} path - The path to find the data, written as a normal dot
       * notation.
       * @param {*} value - The value to set at the end of the path.
       * @example
       * set('path.to.the.data', value);
       * @methodOf module:store~Store
       */
      set: function set(path, value) {
          if (!state) {
              throw 'The store hasn\'t yet ben set for hobbit-archivist.\n                Set the store using \'createStore\' before trying to access it.';
          }
          state.set(path, value);
          notify(path);
      },


      /**
       * Removes the data under the given path if it exists. The path should be an
       * exact path that guides to the right data written like normal dot paths.
       * Will notify all subscribers to that path or a children of that path.
       * @param {string} path - The path to find the data, written as a normal dot
       * notation.
       * @example
       * remove('path.to.the.data');
       * @methodOf module:store~Store
       */
      remove: function remove(path) {
          if (!state) {
              throw 'The store hasn\'t yet ben set for hobbit-archivist.\n                Set the store using \'createStore\' before trying to access it.';
          }
          state.remove(path);
          notify(path);
      },


      /**
       * Resets the whole store by clearing all its values.
       */
      reset: function reset() {
          if (!state) {
              throw 'The store hasn\'t yet ben set for hobbit-archivist.\n                Set the store using \'createStore\' before trying to access it.';
          }
          state.clear();
      }
  };

  /**
   * @module subscribe
   */

  /**
   * <p>
   *   Function that subscribes the component given to part of the state
   *   identified by the path. If any part of the state including that path
   *   changes, the component returned by this functions will be notified
   *   and will trigger the <code>onstatechanged</code> method on the subscribed
   *   component with the new state.
   * </p>
   * <p>
   *   The component will be given two attributes when rendered;
   *   <ul>
   *     <li><b>state</b>: Contains the state obtained by this function.</li>
   *     <li><b>unsubscribe</b>: A function that allows the component to
   *        unsubscribe from notifications if necessary.</li>
   *   </ul>
   * </p>
   * @function subscribe
   * @param {*} component - Mithril component that should be subscribed to the 
   * state. If it includes a <code>onstatechanged</code> method, this will be
   * called whenever the system detects a change in the content of the state.
   * @param {string} path - String path in the usual javascript dot notation that
   * allows the system to find the required data in the state. It it also use for
   * subscription purposes.
   * @returns {Object} Returns a wrapper component that has all the properties
   * necessary to render the subscribed component properly.
   */
  var subscribe = function subscribe(component, path) {
      if (component.view == null && typeof component !== 'function') {
          throw 'subscribe(component, path) expects a component, \n            not a vnode.';
      }

      //Create the subscriber object that will be given to the store
      var subscriber = {
          notify: function notify$$1(notifiedPath) {
              if (path.includes(notifiedPath) && component.onstatechanged) {
                  component.onstatechanged(Store.find(notifiedPath));
              }
          }
      };

      //Subscribe to the store and keep the key
      var key = Store.subscribe(subscriber);
      //Return a new component that renders our original component with the state
      //and unsubscribe function saved up
      return {
          view: function view() {
              return m(component, {
                  state: Store.find(path),
                  unsubscribe: function unsubscribe() {
                      Store.unsubscribe(key);
                  }
              });
          }
      };
  };

  /**
   * @module bind
   */

  /**
   * <p>
   *   Function that binds the component given to part of the state
   *   identified by the path.
   * </p>
   * <p>
   *   The component will be given one attribute when rendered;
   *   <ul>
   *     <li><b>state</b>: Contains the state obtained by this function.</li>
   *   </ul>
   * </p>
   * @function bind
   * @param {*} component - Mithril component that should be bound to the 
   * state.
   * @param {string} path - String path in the usual javascript dot notation that
   * allows the system to find the required data in the state.
   * @returns {Object} Returns a wrapper component that has all the properties
   * necessary to render the subscribed component properly.
   */
  var bind = function bind(component, path) {
      if (component.view == null && typeof component !== 'function') {
          throw 'bind(component, path) expects a component, \n            not a vnode.';
      }

      return {
          view: function view() {
              var state = Store.find(path);
              return m(component, { state: state });
          }
      };
  };

  exports.Store = Store;
  exports.subscribe = subscribe;
  exports.bind = bind;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
