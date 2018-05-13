import m from 'mithril';
import r from 'mithril-hobbit-navigator';

import { Store, subscribe } from '../packages/hobbit-archivist';

import ColoredBlock from './views/components/ColoredBlock';

import './styles/app.scss';

r.createRouter({
    hashbanged: true,
});

const stateStore = Store.createStore({
    time: startTime(),
});

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
        stateStore.set('time', {
            time: startTime(),
        });
    }, 500);
    return  `${hours}:${minutes}:${seconds}`;
}

const index = {
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
    onstatechanged: function(state, newState) {
        m.redraw();
    },
    view: function(vnode) {
        setTimeout(() => {
            //debugger;
            vnode.attrs.unsubscribe();
        }, 5000);
        return m('div.index', [
            m('h1', 'Colored routing display'),
            m('span', `Time: ${vnode.attrs.state.time}`),
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
