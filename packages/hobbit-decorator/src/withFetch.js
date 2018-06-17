import m from 'mithril';

import { enhance } from './enhance';

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
const withFetch = request => component => {
    return enhance((attributes) => {
        let newAttrs = {
            loading: true,
            error: null,
            data: undefined,
        };
        if (typeof(request) === 'function')
        {
            request = request(attributes);
        }
        m.request(request).then((data) => {
            newAttrs = {
                loading: false,
                data,
            };
        }).catch((error) => {
            newAttrs = {
                loading: false,
                error,
            };
        });
        return Object.assign({},
            attributes,
            newAttrs
        );
    }, component);
};

export { withFetch };
 