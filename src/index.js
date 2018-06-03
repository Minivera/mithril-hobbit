import m from 'mithril';
import r from 'mithril-hobbit-navigator';
import { subscribe } from 'mithril-hobbit-archivist';

import { Main } from './views/components/Main';
import { Sidebar } from './views/components/Sidebar';

import './state';

import './styles/app.scss';

r.createRouter({
    //hashbanged: true,
});

const index = {
    time: null,
    oncreate: function(vnode) {
        this.time = vnode.attrs.state;
    },
    onstatechanged: function(newState) {
        if (this.time !== newState)
        {
            this.time = newState;
            m.redraw(); //Redraws on state changed and different
        }
    },
    view: function(vnode) {
        return m('div.index', [
            m(Sidebar),
            m('div.page', [
                m('h1', 'Example'),
                m(Main),
                m('span', `Time: ${vnode.attrs.state}`),
            ]),
        ]);
    },
};

m.mount(document.body.querySelector('#root'), subscribe(index, 'time'));
