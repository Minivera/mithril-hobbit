import m from 'mithril';
import r from 'mithril-hobbit/navigator';

import ColoredBlock from './ColoredBlock';
import { Clock } from './Clock';

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
            m(Clock),
        ]);
    },
};

export { Main };