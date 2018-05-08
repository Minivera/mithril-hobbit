# Mithril Hobbit Navigator

Hobbit navigator is part of the [Hobbit framework]() for mithril. This package contains a componenent based routing system heavily inspired by [React-router](https://github.com/ReactTraining/react-router).

The router component is easy to use and extremly light - weighing less than 2KB - bringing the whole mitrhil package to just about 11 KB.

It does not support any JSX structure (Yet).

## How to install

To install Hobbit navigator, either install the hobbit framework or this package individually through npm :

`npm install --save mithril-hobbit-navigator`

Hobbit navigator is also available as a [UMD module]() in a minified or unminified format.

## How to use

Hobbit navigator is componenent based and thus can be used at any point in the structure. This greatly simplifies your code and allows for varied rendering depending on the current URL.

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

The `r` function creates a router where the componenent or structure given will only render if the URL matches the route pattern. For exemple, the `h3` would only render if the URL is exactly `/index`. `r` can accept either a vnode created by `m` or a component.

`r` also accepts an array of route/view pairs where only the first pair where the route matches the URL will render.

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
A view that always render is no other route could render can be created by giving an empty route pattern. This is usefull for 404 error pages.

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