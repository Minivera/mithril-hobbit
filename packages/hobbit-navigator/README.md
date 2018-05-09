# Mithril Hobbit Navigator

[![NPM Version](https://img.shields.io/npm/v/mithril-hobbit-navigator.svg)](https://www.npmjs.com/package/mithril-hobbit-navigator) [![NPM License](https://img.shields.io/npm/l/mithril-hobbit-navigator.svg)](https://www.npmjs.com/package/mithril-hobbit-navigator) [![NPM Downloads](https://img.shields.io/npm/dm/mithril-hobbit-navigator.svg)](https://www.npmjs.com/package/mithril-hobbit-navigator)

Hobbit navigator is part of the [Hobbit framework](https://github.com/Minivera/mithril-hobbit) for mithril. This package contains a component based routing system heavily inspired by [React-router](https://github.com/ReactTraining/react-router).

The router component is easy to use and extremely light - weighing less than 2KB - bringing the whole mithril package to just about 11 KB.

It does not support any JSX structure (Yet).

## How to install

To install Hobbit navigator, either install the hobbit framework or this package individually through npm:

`npm install --save mithril-hobbit-navigator`

Hobbit navigator is also available as a [UMD module](https://github.com/Minivera/mithril-hobbit/tree/master/packages/hobbit-navigator/umd) in a minified or unminified format.

## How to use

Hobbit navigator is component based and thus can be used at any point in the structure. This greatly simplifies the code and allows for varied rendering depending on the current URL.

```javascript
import m from 'mithril';
import r from 'mithril-hobbit-navigator';

//Create the router, this must always be called before any render.
r.createRouter();

const index = {
    onClickIndex: function() {
        r.navigate('/index');
    },
    view: function() {
        return m('div.index', [
            m('h1', 'Header'),
            //Create a route
            r('/index', m('h3', 'Index')),
            m('div.footrer', [
                m('a', {onclick: this.onClickIndex}, 'Index'),
            ]),
        ]);
    },
};

m.mount(document.body.querySelector('#root'), index);
```

The `r` function creates a router where the component or vnode given will only render if the URL matches the route pattern. For example, the `h3` would only render if the URL is exactly `/index`. `r` can accept either a vnode created by `m` or a component.

`r` also accepts an array of route/view pairs where only the first pair whose route matches the URL will render.

```javascript
r([
    ['/index', m('h3', 'Index')],
    ['/admin', m('h3', 'Admin')]
])
```

The rendered view will always receive the current location in its vnode attributes. It can also be accessed directly with `r.getLocation()`.

```javascript
view: function(vnode) {
    //Location is under vnode.attrs.location
}
```

Parameters can be used in the route pattern and the parameter will be extracted if it matches. For example, `/red` would match '/:color' and the parameter object `{color: 'red'}` would be extracted. The parameters are also accessible in the vnode attributes under `params`.

### Navigating
Navigating is done through the use of the `r.navigate` function, like so:

`r.navigate('/route');`

The function can also receive parameters if using routes pattern with parameters, for example `/:color`. Giving an object with the parameters names as keys will create the route with those parameters.

```javascript
r.navigate('/:color', {color: 'red'});

//Will navigate to /red
```

### 404 Page
A view that always render if no other route could render can be created by giving an empty route pattern. This is useful for 404 error pages.

```javascript
const 404 = ...;

r('', 404);
//Or
r([
    ['/index', m('h3', 'Index')],
    ['/admin', m('h3', 'Admin')],
    ['', 404]
])
```

### Redraws
Hobbit navigator will only rerender when the hash part of the URL changes from a manual change by the user. All other redraws are to be handled manually through the existing auto redraw system from mithril. Remember that mithril can only redraw routes if they are mounted using `m.mount()`.

### Use with the base mithril router
Hobbit navigator can be used with the base router from mithril without conflicts and do not aim to be a replacement to the existing router system.

## API

### `r(*)`
`r` can accept one of two arrangements for its arguments, either `r(route, view, options = {})` or `r([[route, view]], options = {})`.

In both cases, the options object enables some configuration for the routes;

* **loose** will return a match for routes that can be compared with regexes, but are not equal. For example, `/foo` and `/foo/bar` would return true with loose activated. False by default, routes must thus be an equal match to the URL.
* **caseSensitive** will match routes with case sensitivity enabled. True by default.
* **strict** will enfore route patterns to have a trailing slash ("/"). False by default.

### `r.createRouter(configuration)`
`r.createRouter` creates the history router that handles the HTML5 history module. It can be configured through the use of the configuration argument which currently accepts the following options.

* **hashbanged** is a boolean that allows the router to use a hashbang rather than the default routing system. False by default.
* **location** will set the default location of the router when first created without changing the URL. This can be useful for initial redirects or SSR. Location can accept either a string for the route to use or a full location object. If not set, the router will set the initial location using the URL. Unset by default.
* **hashbangPrefix** will chose the prefix to add before the routes when using the hashbanged option. By default, it will add the prefix "#!" before any route.

### `r.getLocation()`
`r.getLocation` returns the current location in the router as an object with useful values.

* **path** contains the path of the last navigation once transformed using parameters.
* **url** is the true url that was navigated to, including any query string arguments or the hashbang prefix.
* **pattern** is the route pattern that was used by the last navigation to create the path.
* **params** is the parameters object that was given in the last navigation to create the path from the pattern.
* **sender** is the sender of the last navigation given when using `r.navigate`.

### `r.navigate(route, params = {}, options = {})`
`r.navigate` navigates the user to a new page using the HTML5 history module. The route argument is necessary to navigate and, if it contains any parameters, will use the parameters given in the param argument to resolve its true path. The options argument takes options similar to `r` and changes the way routes are handled and transformed.

* **sender** set who caused the navigation and is set by the programmer. This option will appear in the location object and is unused by the system, it is however useful for custom animations.
* **force** forces the navigation even if navigating to the exact same route, otherwise it will ignore any navigation to the exact same url.
* **options.replace** will use the `replace` function from the history API rather than the `set` function which changes the way the back button works in browsers.

## Browsers support
Hobbit navigator supports all browsers in theory. However, browsers with no support for the HTML5 history API will experience a browser refresh on navigation, like mithril does with its own router.
