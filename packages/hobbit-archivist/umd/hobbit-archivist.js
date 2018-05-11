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

  var setRecursively = function setRecursively(object, pathParts, value) {
      var _Object$assign;

      //Make sure the current object is actually an object
      if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object') {
          //If not, return self and cancel the recursivity
          return object;
      }
      //Otherwise, continue with the resursivity without mutating
      return Object.assign({}, object, (_Object$assign = {}, _Object$assign[pathParts[0]] = pathParts.length > 1 ? setRecursively(object[pathParts[0]], pathParts.slice(1), value) : value, _Object$assign));
  };

  var memoryInterface = function () {
      function memoryInterface() {
          var initialData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          classCallCheck(this, memoryInterface);

          this.data = initialData;
      }

      memoryInterface.prototype.set = function set$$1(path, value) {
          this.data = setRecursively(this.data, path.split('.'), value);
      };

      memoryInterface.prototype.remove = function remove(path) {
          this.data = setRecursively(this.data, path.split('.'), undefined);
      };

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
                  break;
              }
          }
          //Return the latest found value
          return value;
      };

      memoryInterface.prototype.clear = function clear() {
          this.data = {};
      };

      memoryInterface.prototype.all = function all() {
          return this.data;
      };

      return memoryInterface;
  }();

  var state = void 0;
  var subscribers = [];

  var notify = function notify(path) {
      subscribers.forEach(function (subscriber) {
          if (subscriber.notify) {
              subscriber.notify(path);
          }
      });
  };

  var Store = {
      createStore: function createStore() {
          var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var connector = arguments[1];

          //If there is not connecteor found
          if (!connector) {
              //Create the basic memory connector
              state = new memoryInterface(initialState);
          } else {
              //Create the state with the connecter, you better hope its a constructor!
              state = new connector(initialState);
          }
          return this;
      },
      getState: function getState() {
          if (!state) {
              console.warn('The store hasn\'t yet ben set for hobbit-archivist.\n                Set the store using \'createStore\' before trying to access it.');
              return null;
          }
          return state.all();
      },
      subscribe: function subscribe(subscriber) {
          return subscribers.push(subscriber);
      },
      unsubscribe: function unsubscribe(key) {
          subscribers.splice(key, 1);
      },
      find: function find(path) {
          return state.find(path);
      },
      set: function set(path, value) {
          state.set(path, value);
          notify(path);
      },
      remove: function remove(path) {
          state.remove(path);
          notify(path);
      },
      reset: function reset() {
          state.clear();
      }
  };

  var subscribe = function subscribe(component, path, store) {
      if (component.view == null && typeof component !== 'function') {
          throw new Error('subscribe(component, path, store) expects a component, \n            not a vnode.');
      }

      //Create the subscriber object that will be given to the store
      var subscriber = {
          notify: function notify(notifiedPath) {
              if (notifiedPath === path && component.onstatechanged) {
                  component.onstatechanged(store.find(notifiedPath));
              }
          }
      };

      //Subscribe to the store and keep the key
      var key = store.subscribe(subscriber) - 1;
      //Return a new component that renders our original component with the state
      //and unsubscribe function saved up
      return {
          view: function view() {
              return m(component, {
                  state: store.find(path),
                  unsubscribe: function unsubscribe() {
                      store.unsubscribe(key);
                  }
              });
          }
      };
  };

  var bind = function bind(component, path, store) {
      if (component.view == null && typeof component !== 'function') {
          throw new Error('bind(component, path, store) expects a component, \n            not a vnode.');
      }

      var state = store.find(path);
      return {
          view: function view() {
              return m(component, { state: state });
          }
      };
  };

  exports.Store = Store;
  exports.subscribe = subscribe;
  exports.bind = bind;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
