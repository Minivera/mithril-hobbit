import m from 'mithril';
import r from 'mithril-hobbit-navigator';
import loki from 'lokijs';

import { Store, subscribe } from 'mithril-hobbit-archivist';

import ColoredBlock from './views/components/ColoredBlock';

import './styles/app.scss';

r.createRouter({
    hashbanged: true,
});

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

const stateStore = Store.createStore({
    time: startTime(),
});//, connector);

function checkTime(i) {
    if (i < 10)
    {
        i = '0' + i;
    }
    return i;
}

function startTime() {
    const today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    minutes = checkTime(minutes);
    seconds = checkTime(seconds);
    setTimeout(() => {
        stateStore.set('time', startTime());
    }, 500);
    return  `${hours}:${minutes}:${seconds}`;
}

const index = {
    time: null,
    oncreate: function(vnode) {
        this.time = vnode.attrs.state;
    },
    onClickIndex: function() {
        r.navigate('/index');
    },
    onClickRed: function() {
        r.navigate('/block/:color', {color: 'red'});
    },
    onClickBlue: function() {
        r.navigate('/block/:color', {color: 'blue'});
    },
    onClickGreen: function() {
        r.navigate('/block/:color/:subcolor', {color: 'green', subcolor: 'red'});
    },
    onClick404: function() {
        r.navigate('/404');
    },
    onstatechanged: function(newState) {
        if (this.time !== newState)
        {
            this.time = newState;
            m.redraw(); //Redraws on state changed and different
        }
    },
    view: function(vnode) {
        setTimeout(() => {
            //debugger;
            vnode.attrs.unsubscribe();
        }, 5000);
        return m('div.index', [
            m('h1', 'Colored routing display'),
            m('span', `Time: ${vnode.attrs.state}`),
            r([
                [ '/block/:color', ColoredBlock ],
                [ '/index', m('h3', 'Index') ],
                [ '', m('h3', 'Error 404') ],
            ], {loose: true}),
            m('div.links', [
                m('a', {onclick: this.onClickIndex}, 'Index'),
                m('a', {onclick: this.onClickRed}, 'Red'),
                m('a', {onclick: this.onClickBlue}, 'Blue'),
                m('a', {onclick: this.onClickGreen}, 'Green/Red'),
                m('a', {onclick: this.onClick404}, 'Error page'),
            ]),
        ]);
    },
};

m.mount(document.body.querySelector('#root'), subscribe(index, 'time'));
