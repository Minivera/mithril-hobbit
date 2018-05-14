# Mithril Hobbit Archivist

[![NPM Version](https://img.shields.io/npm/v/mithril-hobbit-archivist.svg)](https://www.npmjs.com/package/mithril-hobbit-archivist) [![NPM License](https://img.shields.io/npm/l/mithril-hobbit-archivist.svg)](https://www.npmjs.com/package/mithril-hobbit-archivist) [![NPM Downloads](https://img.shields.io/npm/dm/mithril-hobbit-archivist.svg)](https://www.npmjs.com/package/mithril-hobbit-archivist)

Hobbit archivist is part of the [Hobbit framework](https://github.com/Minivera/mithril-hobbit) for mithril. It offers a complete system to store and observe an application's state from a central location. This package is heavily inspired from system like [Redux](https://redux.js.org/) and [Cerebral](https://cerebraljs.com/).

The state management system is easy to use and extremely light - weighing less than 1KB - bringing the whole mithril package to just about 9 KB.

## How to install
To install Hobbit archivist, either install the hobbit framework or this package individually through npm:

`npm install --save mithril-hobbit-archivist`

Hobbit archivist is also available as a [UMD module](https://github.com/Minivera/mithril-hobbit/tree/master/packages/hobbit-archivist/umd) in a minified or unminified format.

## How to use
Hobbit archivist need to be configured and started before it can be used. By default, a simple - in-memory - data store is used when creating the first store. This basic data can be used for debugging or simple applications, but more complex project may need a more robust data store.

The store can be created anywhere in the application structure as long as it is created before the rendering process in mithril or before it is used.

```javascript
import { Store } from 'mithril-hobbit-archivist';

const stateStore = Store.createStore();
```

The `createStore` accepts two arguments. The first argument is the intial content of the state store.

```javascript
import { Store } from 'mithril-hobbit-archivist';

const stateStore = Store.createStore({
    foo: 'bar',
});
```

This ensures that the value set as the initial state will always exist in the state on the first rendering even if the `set` method is not called. This is very useful for SSR for example where it is common to cache and load data from the server.

The second argument of `createStore` is the connector, which can be customized for more advanced behavior.

With the store created, the state can be handled using a series of methods from the store.

```javascript
stateStore.getState();
//Returns the whole state store

stateStore.find('this.is.a.path');
//Returns the value in the state if it exists

stateStore.set('this.is.a.path', {value});
//Sets the value in the state. If part of the path does not exist, it creates it

stateStore.remove('this.is.a.path');
//Removes the value from the store

stateStore.clear();
//Clears the store completely
```

### Binding and subscribing
Hobbit archivist exposes two helper function to simplify the binding of values from the store to a component. 

`bind` will bind a specific value from the store to the component it is given, wrapping it in a higher-order component that passes down an attribute called `state` that contains the fetched value.

```javascript
import m from 'mithril';
import { Store, bind } from 'mithril-hobbit-archivist';

const stateStore = Store.createStore({
    foo: 'bar',
});

const index = {
    view: function(vnode) {
        return m('div.index', vnode.attrs.state); // Prints bar
    },
};

m.mount(document.body.querySelector('#root'), bind(index, 'foo'));
```

`subscribe` acts like `bind`, but it also allows for notifying the component of any change in the selected values. The developer is responsible for handling rerenders as the subscribe method only calls a lifecyle method on the wrapped component called `onstatechanged`. In addition to adding the state in the attributes, it also exposes and `unsubscribe` attribute function that stops notification when called.

```javascript
import m from 'mithril';
import { Store, subscribe } from 'mithril-hobbit-archivist';

const stateStore = Store.createStore({
    foo: 'bar',
});

const index = {
    onstatechanged: function(newState) {
        m.redraw(); //Redraws on state changed
    },
    onremove: function(vnode) {
        vnode.attrs.usubscribe(); //Stops notification when removed
    },
    view: function(vnode) {
        return m('div.index', vnode.attrs.state); // Prints bar
    },
};

m.mount(document.body.querySelector('#root'), subscribe(index, 'foo'));
```

The `onstatechanged` lifecycle method will give the new state as its only parameter, if the old state needs to be compared to the new state, the component must keep track of its state by itself.

```javascript
//...

//TODO: API may change when the onstatechanged gets hooked like other lifecycle methods
const index = {
    foo: null,
    oncreate: function(vnode) {
        this.foo = vnode.attrs.state;
    },
    onstatechanged: function(newState) {
        if (this.foo !== newState)
        {
            this.foo = newState;
            m.redraw(); //Redraws on state changed and different
        }
    },
    view: function(vnode) {
        ...
    },
};

//...
```

### Creating a connector
To create a connector, a creatable element must be passed as the second argument of `createStore`, for example, a ES6 class.

This element must then implement all these methods:

```javascript
class connector {
    constructor(initial) { ... }
    
    set(path, value) { ... }
    
    remove(path) { ... }
    
    find(path) { ... }
    
    clear() { ... }
    
    all() { ... }
}
```

Refer to the API and examples for details on the connector interface.

### Use with lokijs as a connector

```javascript
import { Store } from 'mithril-hobbit-archivist';

class connector {
    constructor(initial) {
        //TODO: Create initial state
        this.db = new loki();
        this.data = this.db.addCollection('data');
    }
    
    set(path, value) {
        const existingRecord = this.data.findOne({path});
        if (existingRecord) 
        {
            this.data.update(Object.assign({}, existingRecord, {
                value,
            }));
        }
        else
        {
            this.data.insert({path, value});
        }
    }
    
    remove(path) {
        this.data.findAndRemove({path});
    }
    
    find(path) {
        const found = this.data.findOne({path});
        return found ? found.value : undefined;
    }
    
    clear() {
        this.data.clear();
    }
    
    all() {
        return this.data.find({}).map((record) => record.value);
    }
}

const stateStore = Store.createStore(null, connector);
```

## API

### `Store.createStore(intialState = {}, connector = null)`
`Store.createStore` creates the store with the initial state. If no connector is given, the default memory connector is used which simply creates a basic javascript object in memory.

* **initialState** is the initial state to give to the connector to setup the data on the first load.
* **connector** is the connector to use for the state management. If none is given, the default memory connector is used instead. Any connector must have a set of functions described in the  documentation.

### `Store.getState()`
`Store.getState()` returns the full content of the state store.

### `subscribe(subscriber)`
`subscribe(subscriber)` subscribes the subscriber to the notify functionality of the store. Whenever the `set` or `remove` function is called on the store, it notifies all subscribers with the changed path. The method rutuns a key that can identify the subscriber when it comes to unsubscribing it.

* **subscriber** is the object subscribing to changes in the store. It must implement a `notify(path)` method to receive any notification.

### `unsubscribe(key)`
`unsubscribe(key)` unsubcribes the subscriber under the key from the notification system.

### `find(path)`
`find(path)` finds the value under the path inside the state connector. The path is expected to be a string path with dot notation, though a state connector may change this behavior.

* **path** is the path to find the data, written as a standard javascript dot notation.

### `set(path, value)`
`set(path, value)` sets the given value under the path in the state using the state connector. The path is expected to be a string path with dot notation, though a state connector may change this behavior. In the default memory connector, if the path does not fully exists, it will be created.

* **path** is the path to find the data, written as a standard javascript dot notation.
* **value** is the value to set at the end of the path.

### `remove(path)`
`remove(path)` removes the value under the path using the state connector. The path is expected to be a string path with dot notation, though a state connector may change this behavior.

* **path** is the path to find the data, written as a standard javascript dot notation.

### `reset()`
`reset()` fully resets the store using the state connector.

### `subscribe(component, path)`
`subscribe(component, path)` is a helper to quickly subscribe a component to part of the state. Whenever the state found under the path or any ofits parent is the state tree is changed, the component will see the `onstantechanged` lifecycle hook triggered which then enables it to redraw itself if needed.

* **component** is the component to subscribe to the data. It is given two attribtes, `state` which contains the state found under path if any and `unsubscribe` which is a function that can stop the automatic notification system when called.
* **path** is the path used to find the value inside the state, refer to `State.find` for more info.

### `bind(component, path)`
`bind(component, path)` is a helper to quickly bind a component to part of the state.

* **component** is the component to subscribe to the data. It is given one attribte; `state` which contains the state found under path if any.
* **path** is the path used to find the value inside the state, refer to `State.find` for more info.

## Browsers support
Untested yet.
