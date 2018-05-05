import m from 'mithril';
import r from 'mithril-hobbit-navigator';

import ColoredBlock from './views/components/ColoredBlock';

import './styles/app.scss';

r.createRouter({
    hashbanged: true,
});

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
    view: function() {
        return m('div.index', [
            m('h1', 'Colored routing display'),
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

m.mount(document.body.querySelector('#root'), index);