import m from 'mithril';
import r from 'mithril-hobbit-navigator';

import ColoredBlock from './ColoredBlock';

const Main = {
    view: function(vnode) {
        return m('div.main', [
            r({
                '/block': m('div', [
                    m('h2', 'Colored blocks'),
                    m(ColoredBlock),
                ]),
                '/': m('h2', 'Index'),
                null: m('h2', 'Error 404'),
            }, {loose: true}),
        ]);
    },
};

export { Main };