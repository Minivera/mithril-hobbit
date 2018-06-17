(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('mithril')) :
    typeof define === 'function' && define.amd ? define(['exports', 'mithril'], factory) :
    (factory((global.HobbitNavigator = {}),global.Mithril));
}(this, (function (exports,m) { 'use strict';

    m = m && m.hasOwnProperty('default') ? m['default'] : m;

    /**
     * @module compose
     */

    /**
     * Compose multiple enhacers together to reduce nesting an simplify how
     * components can be enhanced. When using, function are executed from
     * bottom to top, so attributes propagate this way too.
     * @function compose
     */
    var compose = function compose() {
      for (var _len = arguments.length, functions = Array(_len), _key = 0; _key < _len; _key++) {
        functions[_key] = arguments[_key];
      }

      return functions.reduce(function (func1, func2) {
        return function () {
          return func1(func2.apply(undefined, arguments));
        };
      }, function (arg) {
        return arg;
      });
    };

    /**
     * @module expand
     */

    /**
     * <p>
     *  Allows the monkey patching of functions of a component. Can be useful to
     *  run multiple instances of the same lifecycle method.
     * </p>
     * <p>
     *  If the expander function returns a value, the original
     *  function will receive the returned value as its last argument.
     * </p>
     * @function expand
     * @param {Object} expander - Object containing the function to expand under
     * the function's name.
     * @example
     * expand({
     *  onupdate: function,
     * })(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     */
    function expand(expander) {
        //Normal function as rollup canot handle this with arrow functions
        return function (component) {
            var _this = this;

            var _loop = function _loop(func) {
                //Make sure the prop is not inherited and is a function
                if (expander.hasOwnProperty(func) && typeof func === 'function') {
                    var original = component[func];
                    component[func] = function () {
                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                            args[_key] = arguments[_key];
                        }

                        var result = expander[func].apply(_this, args);
                        original.apply(_this, args.concat(result));
                    };
                }
            };

            for (var func in expander) {
                _loop(func);
            }
            return component;
        };
    }

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
    var enhance = function enhance(enhancer, component) {
      return {
        view: function view(vnode) {
          return m(component, _extends({}, enhancer(vnode.attrs, vnode)));
        }
      };
    };

    /**
     * @module withAttrsRename
     */

    /**
     * Allows the attributes of the given component to be renamed using an object
     * or new names.
     * @function withAttrsRename
     * @param {Object} renames - Object where the keys are the original names and
     * the values the new name to give to that attribute. If a value is a function,
     * will be called with the attributes as its parameters.
     * @example
     * withAttrsRename({
     *  original: 'renamed',
     * })(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     */
    var withAttrsRename = function withAttrsRename(renames) {
        return function (component) {
            return enhance(function (attributes) {
                var newAttrs = {};
                for (var attr in renames) {
                    if (renames.hasOwnProperty(attr) && attributes.hasOwnProperty(attr)) {
                        if (typeof request === 'function') {
                            newAttrs[renames[attr]] = attributes[attr](attributes);
                            continue;
                        }
                        newAttrs[renames[attr]] = attributes[attr];
                        continue;
                    }
                    newAttrs[attr] = attributes[attr];
                }
                return newAttrs;
            }, component);
        };
    };

    /**
     * @module withAttrsRename
     */

    /**
     * Allows the attributes to be validated against a set of function for
     * each attribute. Will trigger a warning in the console when an attribute
     * does not comply with the validation.
     * @function withAttrsValidation
     * @param {Object} validators - Object containing all the validation functions
     * under the attributes keys. Each function will receive the attribute, the
     * attrribute name and all attributes as parameters and expect a boolean
     * in return.
     * @example
     * withAttrsValidation({
     *  foo: (value, name) => value === 'bar'
     * })(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     * @todo Allow message customization
     */
    var withAttrsValidation = function withAttrsValidation(validators) {
        return function (component) {
            return enhance(function (attributes) {
                for (var attr in attributes) {
                    //Make sure the prop is not inherited and is a function
                    if (attributes.hasOwnProperty(attr) && validators.hasOwnProperty(attr) && !validators[attr](attributes[attr], attr, attributes)) {
                        console.error('Failed validation on the attribute \'' + attr + '\'');
                    }
                }
                return attributes;
            }, component);
        };
    };

    /**
     * @module withDefaultAttrs
     */

    /**
     * Allows the attributes to be given default values if they are undefined.
     * @function withDefaultAttrs
     * @param {Object} defaults - Object containing all the default values
     * under the attributes keys. If the value is a function, it will be called
     * with the attributes as its argument.
     * @example
     * withDefaultAttrs({
     *  foo: 'bar'
     * })(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     */
    var withDefaultAttrs = function withDefaultAttrs(defaults) {
        return function (component) {
            return enhance(function (attributes) {
                var newAttrs = {};
                for (var attr in attributes) {
                    //Make sure the prop is not inherited and is a function
                    if (attributes.hasOwnProperty(attr) && defaults.hasOwnProperty(attr) && typeof attributes[attr] === 'undefined') {
                        newAttrs[attr] = typeof defaults[attr] === 'function' ? defaults[attr](attributes) : defaults[attr];
                    }
                }
                return Object.assign({}, attributes, newAttrs);
            }, component);
        };
    };

    /**
     * @module withFetch
     */

    /**
     * Allows the component to render itself according to the data returned by
     * an XHR request to a server. This enhancer will rerender the component
     * when the request is complete and provide a loading attribute for convenience.
     * @function withFetch
     * @param {*} request - The request specifications from
     * [mitrhil's documentation]{@link https://mithril.js.org/#xhr}. If a function,
     * will be called with the attributes as its parameters.
     * @example
     * withFetch({
     *  method: "GET",
     *  url: "//localhost/test/api",
     *  data: {foo: 'bar'},
     * })(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     * @see [mitrhil's documentation]{@link https://mithril.js.org/#xhr}
     */
    var withFetch = function withFetch(request) {
        return function (component) {
            return enhance(function (attributes) {
                var newAttrs = {
                    loading: true,
                    error: null,
                    data: undefined
                };
                if (typeof request === 'function') {
                    request = request(attributes);
                }
                m.request(request).then(function (data) {
                    newAttrs = {
                        loading: false,
                        data: data
                    };
                }).catch(function (error) {
                    newAttrs = {
                        loading: false,
                        error: error
                    };
                });
                return Object.assign({}, attributes, newAttrs);
            }, component);
        };
    };

    /**
     * @module withHandle
     */

    /**
     * Adds the given set of functions to the attributes of the component.
     * @function withHandle
     * @param {Object} handlers - Object containing all the handler functions to
     * add to the attributes. All functions are called with their arguments
     * and the component as their this. If handlers is a function, it is called with
     * all the attributes as its parameter.
     * @example
     * withHandle({
     *  onChange: args => { //do something },
     * })(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     */
    var withHandle = function withHandle(handlers) {
        return function (component) {
            return enhance(function (attributes) {
                var newAttrs = {};
                if (typeof handlers === 'function') {
                    handlers = handlers(attributes);
                }

                var _loop = function _loop(attr) {
                    if (handlers.hasOwnProperty(attr) && attributes.hasOwnProperty(attr)) {
                        newAttrs[attr] = function (args) {
                            return handlers[attr].apply(component, args);
                        };
                    }
                };

                for (var attr in handlers) {
                    _loop(attr);
                }
                return Object.assign({}, attributes, newAttrs);
            }, component);
        };
    };

    /**
     * @module withTernary
     */

    /**
     * Allows to execute a kind-of ternary operator on two hocs to chose which
     * one to apply on the given component. If the condition is true, the first
     * hoc will be applied, otherwise the second will.
     * @function withTernary
     * @param {funtion} condition - Function to use as the condition.
     * @param {funtion} firstComp - Component to render as an hoc to the main
     * component if the condition is true.
     * @param {funtion} secondComp - Component to render as an hoc to the main
     * component if the condition is false.
     * @example
     * withTernary(withHandler(...), withState(...))(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     */
    var withTernary = function withTernary(condition, firstComp) {
      var secondComp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return function (component) {
        return {
          view: function view(vnode) {
            var enhancer = condition(vnode.attrs) ? firstComp : secondComp;
            return enhancer(m(component, vnode.attrs));
          }
        };
      };
    };

    /**
     * @module withState
     */

    /**
     * Adds the given state value and state set function to teh attributes. The
     * setter does not handle redraw as mithril does a pretty good job with it
     * already.
     * @function withState
     * @param {string} valueName - The name of the state value ot keep alive
     * in this external state machine.
     * @param {string} setterName - The name of the stter function to use to
     * set the state of that component.
     * @param {*} initialState - Initial value of the state.
     * @example
     * withState('foo', 'setFoo')(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     */
    var withState = function withState(valueName, setterName) {
        var initialState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        return function (component) {
            var state = initialState;
            return enhance(function (attributes) {
                var _Object$assign;

                return Object.assign({}, attributes, (_Object$assign = {}, _Object$assign[valueName] = state, _Object$assign[setterName] = function (newValue) {
                    return state = newValue;
                }, _Object$assign));
            }, component);
        };
    };

    /**
     * @module withTransform
     */

    /**
     * Allows the attributes of the given component to be tranformed using a
     * transformation, acting like a map on object values.
     * @function withTransform
     * @param {Object} transformators - Object containgin functions mapped under
     * the key of the attribute they should transform. Each function will receive
     * the attribute, its name and the array of attributes. It is expected to return
     * the new value for the attribute. If transformators is a function, it
     * is called with all the attributes as its parameter.
     * @example
     * withTransform({
     *  foo: (attribute, index, attributes) => `${attribute}_transformed`,
     * })(component);
     * @returns {function} Returns a closure function that takes the component
     * as its argument so it can be easily composed.
     */
    var withTransform = function withTransform(transformators) {
        return function (component) {
            return enhance(function (attributes) {
                var newAttrs = {};
                if (typeof transformators === 'function') {
                    transformators = transformators(attributes);
                }
                for (var attr in transformators) {
                    if (transformators.hasOwnProperty(attr) && attributes.hasOwnProperty(attr)) {
                        newAttrs[attr] = transformators[attr](attributes[attr], attr, attributes);
                    }
                }
                return Object.assign({}, attributes, newAttrs);
            }, component);
        };
    };

    exports.compose = compose;
    exports.expand = expand;
    exports.withAttrsRename = withAttrsRename;
    exports.withAttrsValidation = withAttrsValidation;
    exports.withDefaultAttrs = withDefaultAttrs;
    exports.withFetch = withFetch;
    exports.withHandle = withHandle;
    exports.withTernary = withTernary;
    exports.withState = withState;
    exports.withTransform = withTransform;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
