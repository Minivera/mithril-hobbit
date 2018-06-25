# Mithril Hobbit Decorator

[![NPM Version](https://img.shields.io/npm/v/mithril-hobbit-decorator.svg)](https://www.npmjs.com/package/mithril-hobbit-decorator) [![NPM License](https://img.shields.io/npm/l/mithril-hobbit-decorator.svg)](https://www.npmjs.com/package/mithril-hobbit-decorator) [![NPM Downloads](https://img.shields.io/npm/dm/mithril-hobbit-decorator.svg)](https://www.npmjs.com/package/mithril-hobbit-decorator)

Hobbit decorator is part of the [Hobbit framework](https://github.com/Minivera/mithril-hobbit) for mithril. This package contains a set of components to improve the functionalities for micro-components and introduce better programming habits to mithril.

The component set is easy to use and extremely light - weighing less than 1KB - bringing the whole mithril package to just about 9 KB.

## How to install

To install Hobbit decorator, either install the hobbit framework or this package individually through npm:

`npm install --save mithril-hobbit-decorator`

Hobbit decorator is also available as a [UMD module](https://github.com/Minivera/mithril-hobbit/tree/master/packages/hobbit-decorator/umd) in a minified or unminified format.

## How to use

Hobbit decorator exports a set of 10 decorators - referred as enhancers in this documentation - to improve Mithril components. All enhancers work as closures, they take their initial parameters and return a function to be called again with the component they should enhance.

```javascript
import { withState } from 'mithril-hobbit-decorator';

const Component = {
    view: function() {
        ...
    }
};

const enhanced = withState(...)(Component);
```

This pattern allows the functions to be easily composed and called together as to enhance one component with multiple components.

```javascript
import { withAttrsValidation, withDefaultAttrs, compose } from 'mithril-hobbit-decorator';

const Component = {
    view: function() {
        ...
    }
};

const composed = compose(
    withAttrsValidation(...),
    withDefaultAttrs(...)
)(Component);
```

Note that attrs flow from top to bottom, so in the previous example, `withAttrsValidation` would change the attributes of the vnode before `withDefaultAttrs` did. 

This pattern also allows creating enhancers and keeping them as modules to be used elsewhere, improving an application's modularity.

```javascript
// module.js
import { withDefaultAttrs } from 'mithril-hobbit-decorator';

export withDefaultAttrs(...);

// index.js
import module from 'module.js';

const Component = {
    view: function() {
        ...
    }
};

const enhanced = module(Component);
```

Of course, exported modules can be composed as well.

```javascript
// module1.js
import { withAttrsValidation } from 'mithril-hobbit-decorator';

export withAttrsValidation(...);

// module2.js
import { withDefaultAttrs } from 'mithril-hobbit-decorator';

export withDefaultAttrs(...);

// index.js
import { compose } from 'mithril-hobbit-decorator';
import module1 from 'module1.js';
import module2 from 'module2.js';

const Component = {
    view: function() {
        ...
    }
};

const enhanced = compose(
    module1,
    module2
)(Component);
```

### Why?

Hobbit decorator is meant as a lightweight utility belt for mithril, adding some mush needed functionalities for component. For those used to Recompose/Recompact for React, hobbit decorator will feel very similar to those libraries.

To quickly illustrate why developer should use hobbit decorator, lets looks at a standard component in mithril.

```javascript
const Component = {
    view(vnode) {
        return m('div', vnode.attrs.children);
    }
};
```

As functionalities are added to this component, it can quickly get bloated with a variety of functionalities that have very specific conditions which makes component hard to test and read. For example;

```javascript
const Component = {
    loading: true,
    error: null,
    data: undefined,
    oninit: function(vnode) {
        m.request(vnode.attrs.request).then((result) => {
            vnode.state.loading = false;
            vnode.state.data = result;
        }).catch((error) => {
            vnode.state.loading = false;
            vnode.state.error = error;
        });
    },
    view: function(vnode) {
        const { onChange, inputValue } = vnode.attrs;
        const { loading, error, data } = vnode.state;
        
        if (loading) {
            return m('div', 'loading....');
        }
        
        return error != null ? 
            m('div', 'Error') :
            m('div', [
                m('span', data),
                m('input', {
                    value: inputValue || 'Please enter a value',
                    oninput: onChange,
                }),
                vnode.attrs.children
            ]);
    }
};
```

What was before a 'dumb' component - a component who did not handle its state - has now become a 'smart' and bloated component. What if we could bring this component back to its original micro-state while still giving it the desired behavior? Hobbit decorated can be used to add those functionalities to a micro-component.

```javascript
import { compose, toEnhancer, withFetch, withTernary, withDefaultAttrs } from 'mithril-hobbit-decorator';
import loader from './loader';

const Component = {
    view: function(vnode) {
        const { onChange, inputValue, error, data } = vnode.attrs;
        
        return error != null ? 
            m('div', 'Error') :
            m('div', [
                m('span', data),
                m('input', {
                    value: inputValue,
                    oninput: onChange,
                }),
                vnode.attrs.children
            ]);
    }
};

const enhanced = compose(
    withDefaultAttrs({
        onChange: () => {},
        inputValue: 'Please enter a value',
    }),
    withFetch((attrs) => attrs.request),
    withTernary(
        (attrs) => attrs.loading,
        toEnhancer(loader),
        Component
    ),
)(Component);
```

The component itself is kept pure and dumb, making it very easily testable and predictable. We could further modularize this component by sending all the enhancers to their own file, making them as easily testable as the base component.

### Recipes
Todo

## API

### `compose(...enhancers)(component)`
`compose` executes all the given enhancers on the component from top to bottom, passing the enhanced props to the next enhancers up to the component itself. The utility is useful to simplify calling multiple enhancers one after the other.

```javascript
//This
const enhanced = enhancer2(...)(enhancer1(...)(Component))

//Becomes this, note that the order goes from top to bottom
const compose(
    enhancer1(...),
    enhancer2(...),
)(Component)
```

* **enhancers** is a set of functions that must return another function for compose to work.

### `expand(object)(component)`
`expand` is a utility that allows functions in an object to monkey-path the original functions of component. For example, with expand, lifecycle methods can now be called multiple times, adding more freedom to library developers. The original function will always be called last with the result from the previous call as an added parameter.

```javascript
const Component = {
    view: function(vnode, prev) {
        // called last, prev is the value returned from extraExpanded
    }
};

const expanded = expand({
    view: function(vnode) {
        // called first
    }
})(Component);

const extraExpanded = expand({
    view: function(vnode, prev) {
        // called second, prev is the value returned from expanded
    }
})(expanded);
```

* **objet** is an object of functions. It the element of object exists in the expanded component, it will be monkey-patched.

### `toEnhancer(component)`
`toEnhancer` is a simple utility that transforms a normal component into an enhancer, making it possible to be called into compose or other enhancers. It is especially useful when combined with `withTernary`.

```javascript
const Component = {
    view: function(vnode) {
        ...
    }
};

//Will only render if the condition is true
const enhanced = withTernary(
    () => { ... },
    toEnhancer(Component),
);
```

* **component** is the component to transform into an enhancer, it must be a valid component. Note that calling it as an enhancer will end the chain.

### `withAttrsRename(renames)`
`withAttrsRename` is an enhancer that can rename attributes to make them easier to use within the components. Its parameter is an object where the keys are the old name and the value associated with the key is the new name to give to that attribute. If the value is a function, it will be called with all the attributes as its parameter to make renaming more dynamic.

```javascript
const enhanced = withAttrsRename({
    foo: 'bar', //will rename any attribute 'foo' to 'bar'
})(Component);
```

### `withAttrsValidation(validators)`
`withAttrsValidation` is an enhancer that adds the functionalities of react `prop-types` to a component where the validators given can ensure that the attributes the enhancer receives follow the specific set of rules defined by the developer. The validators parameter is an object of functions mapped under the name of the attribute they should validate. Each function will receive three parameters, the attribute itself, its name and all the attributes of the component. All functions should return a value that can be evaluated as a boolean.

If a validator does not pass, it will trigger a console error whether on production or development environments, but will not lead to any crash or loss of functionalities.

```javascript
const enhanced = withAttrsRename({
    foo: (value) => value !== "",
})(Component);
```

### `withDefaultAttrs(defaults)`
`withDefaultAttrs` is an enhancer that can replace undefined attributes with a default value to ensure they are always set to a predictable value. The defaults object is a set of default values mapped under the name of the attribute they should ensure the default value. The default is applied only if the exact type of the attribute is undefined. The default can also be a function in which case it is called with all the attributes as its parameters and should return the value to set as default.

```javascript
const enhanced = withDefaultAttrs({
    foo: "bar", //Will make the value of attribute foo equal to bar if it was undefined
})(Component);
```

### `withFetch(request)`
`withFetch` is an enhancer that wraps the base fetch functionalities of mithril in an enhancer for ease of use. 

When the enhancer is called, the enhanced component will be returned with a loading attribute set to true. It will also receive an error and data attribute, all undefined. 

Once the request ends, if it triggered an error the loading attribute will be set to false and the error set to whatever error was caught. If it succeeded, the loading attribute will be set to false and the data attribute set to whatever value the fetch returned.

* **request** is an object identical to the object expected from `m.request`. [See mithril's documenation](https://mithril.js.org/index.html#xhr).

### `withHandle(handlers)`
`withHandle` is an enhancer that adds a set of functions to the attributes of a component. If handlers is a function, it will be called with the attributes as its parameters an expect an object of functions in return. If an object, it should be an object of the functions to add to attributes.

**withHandle is very likely to change for a version that is not simply a "functions only" version of withTransform in the future**

```javascript
const state;

const enhanced = withHandle({
    onChange: (value) => state = value,
})(Component);
```

### `withState(valueName, setterName, initialState = null)`
`withState` is an enhancer that adds an external piece of state to a components attribute. It will add an attribute under the `valueName` key as well ass a setter function under the `setterName` key. An initial state can be given to preset the value of the state, otherwise it will be set to null.

```javascript
const Component = {
    view: function(vnode) {
        return m('input', {
            value: vnode.attrs.foo, //Will default to 'bar'
            oninput: vnode.attrs.setFoo,
        });
    },
};

const enhanced = withState('foo', 'setFoo', 'bar')(Component);
```

### `withTernary(condition, first, second = null)`
`withTernary` is an enhancer that will render one of two enhancers with the base component depending on the condition. Condition must be a function that will receive the attributes as its parameter and should return a value that can be evaluated to a boolean. If the condition is true, the first enhancer is rendered, otherwise the second will be rendered. The second enhancer can be ignored to render nothing in case the condition is false.

```javascript
const enhanced = withTernary(
    (attrs) => attrs.type === "string",
    withDefaultAttrs({foo: ""}),
    withDefaultAttrs({foo: 0}),
)(Component);
```

### `withTransform(transformators)`
`withTransform` is an enhancer that allows attributes to be transformed before they are passed to the base component. Transformators is an object where each key is the name of the attribute to transform and the value a function to be used for transforming the attribute. If transformators is a function, it is first called with all the attributes as its parameters and should return an object with the same specifications.

All transform functions are called with three arguments, the attribute itself, its name and all the attributes given to the component.

```javascript
const enhanced = withTransform({
    foo: (foo) => foo + "_bar"
})(Component);
```

## Browsers support
Not tested yet.
