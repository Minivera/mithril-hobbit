import m from 'mithril';
import r from 'mithril-hobbit/navigator';

import { Main } from './views/components/Main';
import { Sidebar } from './views/components/Sidebar';

import './state';

import './styles/app.scss';

r.createRouter({
    hashbanged: true,
    hashbangPrefix: '#__!',
    //location: '/block/blue',
});

const index = {
    view: function(vnode) {
        return m('div.index', [
            m(Sidebar),
            m('div.page', [
                m('h1', 'Example'),
                m(Main),
            ]),
        ]);
    },
};

m.mount(document.body.querySelector('#root'), index);
